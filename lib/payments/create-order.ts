import "server-only";

import crypto from "crypto";
import { isRegistrationOpen } from "@/lib/batches/availability";
import { getStore } from "@/lib/db";
import { devCheckoutAllowed, signDevCheckout } from "@/lib/payments/dev-checkout";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { razorpayConfigured, razorpayKeyId } from "@/lib/server-config";
import type { Registration } from "@/lib/types";
import type { RegistrationInput } from "@/lib/validation/registration";

function blankRegistration(input: RegistrationInput, amount: number, batch: { id: string; batch_number: string; name: string; start_date: string; end_date: string }): Registration {
  const now = new Date().toISOString();
  return {
    id: `reg-${crypto.randomBytes(6).toString("hex")}`,
    registration_number: `UN-REG-${Date.now().toString().slice(-6)}${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
    invoice_id: "",
    batch_id: batch.id,
    batch_number: batch.batch_number,
    batch_name: batch.name,
    batch_date: `${batch.start_date} - ${batch.end_date}`,
    full_name: input.fullName,
    email: input.email,
    whatsapp_number: input.phone,
    qualification_level: input.caLevel,
    attempt_details: input.attemptDetails || "",
    amount,
    currency: "INR",
    razorpay_order_id: "",
    razorpay_payment_id: "",
    payment_status: "pending",
    registration_status: "pending",
    webhook_confirmed: false,
    drive_access_status: "not_started",
    drive_access_error: "",
    sheets_sync_status: "not_started",
    sheets_sync_error: "",
    access_email_status: "not_started",
    access_email_error: "",
    invoice_email_status: "not_started",
    invoice_email_error: "",
    paid_at: "",
    created_at: now,
    updated_at: now,
  };
}

export async function startCheckout(input: RegistrationInput) {
  const store = await getStore();
  const batch = await store.getBatch(input.batchId);
  if (!batch || !isRegistrationOpen(batch)) {
    throw new Error("This batch is closed or the registration deadline has passed.");
  }
  const amount = batch.fee;
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("This batch is not available for payment.");
  }

  const alreadyPaid = await store.findPaidByEmailAndBatch(input.email, batch.id);
  if (alreadyPaid) {
    throw new Error("This email is already registered for the selected batch.");
  }

  const reusable = await store.findReusablePending(input.email, batch.id);
  const registration = reusable
    ? {
        ...reusable,
        full_name: input.fullName,
        whatsapp_number: input.phone,
        qualification_level: input.caLevel,
        attempt_details: input.attemptDetails || "",
        amount,
        batch_number: batch.batch_number,
        batch_name: batch.name,
        batch_date: `${batch.start_date} - ${batch.end_date}`,
        updated_at: new Date().toISOString(),
      }
    : blankRegistration(input, amount, batch);

  if (!razorpayConfigured()) {
    if (!devCheckoutAllowed()) {
      throw new Error("Online payment is temporarily unavailable. Please contact us on WhatsApp.");
    }
    const orderId = `order_dev_${crypto.randomBytes(8).toString("hex")}`;
    registration.razorpay_order_id = orderId;
    await store.saveRegistration(registration);
    return {
      keyId: "",
      orderId,
      amount,
      amountInPaise: amount * 100,
      currency: "INR" as const,
      registrationId: registration.id,
      batchName: batch.name,
      batchNumber: batch.batch_number,
      devCheckout: true,
      devToken: signDevCheckout(orderId, registration.id, amount),
    };
  }

  const order = await createRazorpayOrder(amount * 100, registration.id, {
    registrationId: registration.id,
    batchId: batch.id,
    email: input.email,
  });
  registration.razorpay_order_id = order.id;
  await store.saveRegistration(registration);

  return {
    keyId: razorpayKeyId(),
    orderId: order.id,
    amount,
    amountInPaise: amount * 100,
    currency: "INR" as const,
    registrationId: registration.id,
    batchName: batch.name,
    batchNumber: batch.batch_number,
    devCheckout: false,
    devToken: "",
  };
}
