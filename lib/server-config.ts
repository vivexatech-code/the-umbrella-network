import "server-only";

export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

export function razorpayKeySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET || "";
}

export function razorpayWebhookSecret(): string {
  return process.env.RAZORPAY_WEBHOOK_SECRET || "";
}

export function razorpayConfigured(): boolean {
  const key = razorpayKeyId();
  const secret = razorpayKeySecret();
  return Boolean(key && secret && !key.includes("placeholder") && !secret.includes("placeholder"));
}

export function businessDetails() {
  return {
    name: process.env.BUSINESS_NAME || "The Umbrella Network",
    email: process.env.BUSINESS_EMAIL || process.env.ADMIN_EMAIL || "caumbrellanetwork@gmail.com",
    phone: process.env.BUSINESS_PHONE || "+91 9996506041",
    address: process.env.BUSINESS_ADDRESS || "India",
    gstin: process.env.BUSINESS_GSTIN || "",
    mentor: "CA Harsh Kaushik",
  };
}

export function fallbackDriveUrl(): string {
  return process.env.GOOGLE_DRIVE_RESOURCES_URL || "";
}
