import "server-only";

import { razorpayKeyId, razorpayKeySecret } from "@/lib/server-config";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  email?: string;
  contact?: string;
}

function authHeader() {
  const token = Buffer.from(`${razorpayKeyId()}:${razorpayKeySecret()}`).toString("base64");
  return `Basic ${token}`;
}

async function razorpayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: { description?: string } };
  if (!response.ok) {
    const description = body.error?.description || "Razorpay request failed.";
    if (response.status === 401 || /authentication failed/i.test(description)) {
      throw new Error(
        "Razorpay rejected the API keys. Open Razorpay Dashboard → Account & Settings → API Keys, and paste the Key Secret for this Key Id into RAZORPAY_KEY_SECRET.",
      );
    }
    throw new Error(description);
  }
  return body;
}

export function createRazorpayOrder(amountInPaise: number, receipt: string, notes: Record<string, string>) {
  return razorpayFetch<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes,
    }),
  });
}

export function fetchRazorpayPayment(paymentId: string) {
  return razorpayFetch<RazorpayPayment>(`/payments/${paymentId}`);
}
