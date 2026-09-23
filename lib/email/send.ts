import "server-only";

import { Resend } from "resend";
import { businessDetails } from "@/lib/server-config";

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error("Email service is not configured.");
  }
  const business = businessDetails();
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: `${business.name} <${fromEmail}>`,
    to,
    replyTo: business.email,
    subject,
    html,
  });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data?.id || "";
}
