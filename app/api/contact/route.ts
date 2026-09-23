import crypto from "crypto";
import { getStore } from "@/lib/db";
import { clientIp, jsonError, jsonOk } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(20).optional().default(""),
  message: z.string().trim().min(5).max(2000),
});

export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return jsonError("Please wait before sending another message.", 429);
  }
  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Please provide your name, email, and message.");
  const store = await getStore();
  await store.addContact({
    id: `msg-${crypto.randomBytes(4).toString("hex")}`,
    name: parsed.data.name.replace(/[<>]/g, ""),
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone.replace(/[<>]/g, ""),
    message: parsed.data.message.replace(/[<>]/g, ""),
    created_at: new Date().toISOString(),
  });
  return jsonOk({ message: "Message sent successfully. We will get back to you shortly!" });
}
