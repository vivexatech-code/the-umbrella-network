import { NextResponse } from "next/server";
import { clientIp, jsonError, jsonOk } from "@/lib/http";
import { startCheckout } from "@/lib/payments/create-order";
import { rateLimit } from "@/lib/rate-limit";
import { parseRegistration } from "@/lib/validation/registration";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: Request) {
  if (!rateLimit(`order:${clientIp(request)}`, 8, 10 * 60 * 1000)) {
    return jsonError("Too many attempts. Please wait a few minutes and try again.", 429);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid registration details.");
  }
  const parsed = parseRegistration(body);
  if (!parsed.success) return jsonError(parsed.error);
  try {
    const checkout = await startCheckout(parsed.data);
    return jsonOk({ checkout });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be started.";
    const status = /unavailable|Razorpay/i.test(message) ? 503 : 400;
    return jsonError(message, status);
  }
}
