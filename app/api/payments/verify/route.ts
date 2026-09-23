import { getStore } from "@/lib/db";
import { clientIp, jsonError, jsonOk } from "@/lib/http";
import { confirmCapturedPayment, toSuccessResponse } from "@/lib/payments/confirm";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!rateLimit(`verify:${clientIp(request)}`, 20, 10 * 60 * 1000)) {
    return jsonError("Too many verification attempts. Please wait and try again.", 429);
  }
  const body = (await request.json().catch(() => null)) as {
    registrationId?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    devToken?: string;
  } | null;
  const devOrder = Boolean(body?.razorpay_order_id?.startsWith("order_dev_") && body.devToken);
  if (!body?.razorpay_order_id || (!devOrder && (!body.razorpay_payment_id || !body.razorpay_signature))) {
    return jsonError("Payment confirmation details are incomplete.");
  }

  const store = await getStore();
  const existingPayment = body.razorpay_payment_id ? await store.findByPaymentId(body.razorpay_payment_id) : null;
  if (existingPayment && existingPayment.payment_status === "paid" && existingPayment.razorpay_order_id !== body.razorpay_order_id) {
    return jsonError("This payment has already been used.", 409);
  }

  const result = await confirmCapturedPayment({
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id || "",
    signature: body.razorpay_signature,
    webhookConfirmed: false,
    devToken: body.devToken,
  });
  if (!result.ok) return jsonError(result.error);
  if (body.registrationId && result.registration.id !== body.registrationId && result.registration.razorpay_order_id !== body.razorpay_order_id) {
    return jsonError("Payment could not be matched to this registration.", 400);
  }
  return jsonOk(toSuccessResponse(result.registration, { whatsapp: result.whatsapp, drive: result.drive }));
}
