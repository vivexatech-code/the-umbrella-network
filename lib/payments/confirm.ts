import "server-only";

import crypto from "crypto";
import { getStore } from "@/lib/db";
import { verifyDevCheckout } from "@/lib/payments/dev-checkout";
import { fulfillRegistration } from "@/lib/payments/fulfill";
import { fetchRazorpayPayment } from "@/lib/payments/razorpay";
import { verifyPaymentSignature } from "@/lib/payments/signature";
import { razorpayKeySecret } from "@/lib/server-config";
import type { PaymentSuccessResponse, Registration } from "@/lib/types";

export function toSuccessResponse(registration: Registration, batchLinks?: { whatsapp?: string; drive?: string }): PaymentSuccessResponse {
  const paid = registration.payment_status === "paid";
  return {
    success: true,
    message: paid ? "Payment verified and registration confirmed." : "Payment is still being confirmed.",
    registrationId: registration.id,
    registrationNumber: registration.registration_number,
    studentName: registration.full_name,
    studentEmail: registration.email,
    batchNumber: registration.batch_number,
    batchName: registration.batch_name,
    batchDate: registration.batch_date,
    amount: registration.amount,
    paymentId: registration.razorpay_payment_id,
    paymentMethod: "Razorpay",
    status: paid ? "verified" : "pending_verification",
    requiresVerification: !paid,
    whatsappLink: paid ? batchLinks?.whatsapp : undefined,
    driveResourcesLink: paid ? batchLinks?.drive : undefined,
    emailSent: registration.access_email_status === "success",
    invoiceId: registration.invoice_id,
  };
}

export async function confirmCapturedPayment(input: {
  orderId: string;
  paymentId: string;
  signature?: string;
  webhookConfirmed: boolean;
  devToken?: string;
}) {
  const store = await getStore();
  const registration = await store.findByOrderId(input.orderId);
  if (!registration) return { ok: false as const, error: "We could not find this registration." };

  if (input.orderId.startsWith("order_dev_")) {
    if (!verifyDevCheckout(input.orderId, registration.id, registration.amount, input.devToken || "")) {
      return { ok: false as const, error: "Payment verification failed." };
    }
    const paymentId = input.paymentId || `pay_dev_${crypto.randomBytes(6).toString("hex")}`;
    const marked = await store.markPaid(registration.id, paymentId, false);
    if (!marked) return { ok: false as const, error: "Registration could not be updated." };
    const fulfilled = await fulfillRegistration(marked.registration.id);
    const batch = await store.getBatch(marked.registration.batch_id);
    return {
      ok: true as const,
      registration: fulfilled || marked.registration,
      whatsapp: batch?.whatsapp_link,
      drive: batch?.drive_folder_url,
    };
  }

  if (!input.webhookConfirmed) {
    const secret = razorpayKeySecret();
    if (!input.signature || !verifyPaymentSignature(input.orderId, input.paymentId, input.signature, secret)) {
      return { ok: false as const, error: "Payment verification failed. If money was debited, it will be confirmed automatically." };
    }
  }

  const payment = await fetchRazorpayPayment(input.paymentId);
  const amountPaise = registration.amount * 100;
  if (payment.order_id !== input.orderId || payment.amount !== amountPaise || payment.currency !== "INR") {
    return { ok: false as const, error: "Payment details did not match this registration." };
  }
  if (payment.status !== "captured" && payment.status !== "authorized") {
    if (payment.status === "failed") {
      await store.markPaymentState(registration.id, "failed");
    }
    return { ok: false as const, error: "Payment was not completed." };
  }

  const marked = await store.markPaid(registration.id, input.paymentId, input.webhookConfirmed);
  if (!marked) return { ok: false as const, error: "Registration could not be updated." };

  const fulfilled = await fulfillRegistration(marked.registration.id);
  const batch = await store.getBatch(marked.registration.batch_id);
  return {
    ok: true as const,
    registration: fulfilled || marked.registration,
    whatsapp: batch?.whatsapp_link,
    drive: batch?.drive_folder_url,
  };
}
