import assert from "node:assert/strict";
import { isBatchExpired, isRegistrationOpen } from "../lib/batches/availability";
import { verifyPaymentSignature, verifyWebhookSignature } from "../lib/payments/signature";
import { parseRegistration } from "../lib/validation/registration";
import type { Batch } from "../lib/types";
import crypto from "node:crypto";

const batch = {
  id: "batch-05",
  status: "active",
  registration_deadline_at: "2026-09-30T23:59:00+05:30",
  max_seats: 100,
  seats_booked: 10,
} as Batch;

assert.equal(isRegistrationOpen(batch, Date.parse("2026-09-22T12:00:00+05:30")), true);
assert.equal(isRegistrationOpen(batch, Date.parse("2026-10-01T00:00:00+05:30")), false);
assert.equal(isBatchExpired(batch, Date.parse("2026-10-01T00:00:00+05:30")), true);

const closed = { ...batch, status: "inactive" as const };
assert.equal(isRegistrationOpen(closed, Date.parse("2026-09-22T12:00:00+05:30")), false);

const secret = "test_secret";
const orderId = "order_123";
const paymentId = "pay_123";
const signature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
assert.equal(verifyPaymentSignature(orderId, paymentId, signature, secret), true);
assert.equal(verifyPaymentSignature(orderId, paymentId, "bad", secret), false);

const body = JSON.stringify({ event: "payment.captured" });
const webhookSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
assert.equal(verifyWebhookSignature(body, webhookSignature, secret), true);
assert.equal(verifyWebhookSignature(body, webhookSignature, "other"), false);

const parsed = parseRegistration({
  fullName: "Yash Malhotra",
  email: "Yash@Gmail.com",
  phone: "+91 9876543210",
  caLevel: "CA Inter - Both Groups Cleared",
  attemptDetails: "May 2026",
  batchId: "batch-05",
  amount: 1,
});
assert.equal(parsed.success, true);
if (parsed.success) {
  assert.equal(parsed.data.email, "yash@gmail.com");
  assert.equal(parsed.data.phone, "9876543210");
  assert.equal("amount" in parsed.data, false);
}

const honeypot = parseRegistration({
  fullName: "Bot",
  email: "bot@example.com",
  phone: "9876543210",
  caLevel: "CA Inter - Both Groups Cleared",
  batchId: "batch-05",
  company: "spam",
});
assert.equal(honeypot.success, false);

console.log("Core payment and batch checks passed.");
