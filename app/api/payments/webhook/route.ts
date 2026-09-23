import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { confirmCapturedPayment } from "@/lib/payments/confirm";
import { verifyWebhookSignature } from "@/lib/payments/signature";
import { razorpayWebhookSecret } from "@/lib/server-config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const eventId = request.headers.get("x-razorpay-event-id") || "";
  const secret = razorpayWebhookSecret();
  if (!secret || !verifyWebhookSignature(raw, signature, secret)) {
    return jsonError("Invalid webhook signature.", 400);
  }

  const store = await getStore();
  if (eventId && (await store.hasWebhookEvent(eventId))) {
    return jsonOk({ duplicate: true });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return jsonError("Invalid webhook payload.", 400);
  }

  try {
    const payment = event.payload?.payment?.entity;
    if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.id && payment.order_id) {
      await confirmCapturedPayment({
        orderId: payment.order_id,
        paymentId: payment.id,
        webhookConfirmed: true,
      });
    }
    if (event.event === "payment.failed" && payment?.order_id) {
      const registration = await store.findByOrderId(payment.order_id);
      if (registration && registration.payment_status === "pending") {
        await store.markPaymentState(registration.id, "failed");
      }
    }
    if ((event.event === "refund.processed" || event.event === "payment.refunded") && payment?.order_id) {
      const registration = await store.findByOrderId(payment.order_id);
      if (registration && registration.payment_status === "paid") {
        await store.updateRegistration(registration.id, { payment_status: "refunded" });
      }
    }
    if (eventId) await store.recordWebhookEvent(eventId);
  } catch (error) {
    console.error("Razorpay webhook failed", error);
    return jsonError("Webhook processing failed.", 500);
  }

  return jsonOk({ received: true });
}
