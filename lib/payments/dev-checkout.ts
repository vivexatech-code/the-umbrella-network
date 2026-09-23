import "server-only";

import crypto from "crypto";

export function devCheckoutAllowed() {
  return process.env.NODE_ENV !== "production";
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "local-dev-checkout";
}

export function signDevCheckout(orderId: string, registrationId: string, amount: number) {
  return crypto.createHmac("sha256", secret()).update(`${orderId}|${registrationId}|${amount}`).digest("hex");
}

export function verifyDevCheckout(orderId: string, registrationId: string, amount: number, token: string) {
  if (!devCheckoutAllowed()) return false;
  if (!orderId.startsWith("order_dev_") || !token) return false;
  const expected = signDevCheckout(orderId, registrationId, amount);
  const left = Buffer.from(expected);
  const right = Buffer.from(token);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
