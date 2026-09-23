import { businessDetails } from "@/lib/server-config";
import type { Batch, Registration } from "@/lib/types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, body: string): string {
  const business = businessDetails();
  return `<!DOCTYPE html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#1e293b;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <div style="background:#0f172a;padding:24px 28px;border-bottom:3px solid #1d4ed8;">
      <div style="color:#fff;font-weight:800;font-size:18px;">THE UMBRELLA NETWORK</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:4px;">${escapeHtml(title)}</div>
    </div>
    <div style="padding:28px;">${body}</div>
    <div style="background:#f1f5f9;padding:16px 28px;font-size:12px;color:#64748b;">
      ${escapeHtml(business.name)} · ${escapeHtml(business.mentor)}<br/>
      <a href="mailto:${escapeHtml(business.email)}" style="color:#2563eb;">${escapeHtml(business.email)}</a>
      · ${escapeHtml(business.phone)}
    </div>
  </div></body></html>`;
}

export function accessEmail(registration: Registration, batch: Batch) {
  const subject = `Your session access: CA Articleship Masterclass (${registration.batch_number})`;
  const html = shell(
    "Session access",
    `<p style="font-size:16px;">Dear <strong>${escapeHtml(registration.full_name)}</strong>,</p>
    <p>Your seat for <strong>${escapeHtml(registration.batch_name)}</strong> (${escapeHtml(registration.batch_number)}) is confirmed. This email contains your session access details.</p>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
      <div style="font-weight:800;color:#1e3a8a;">Google Drive resources</div>
      <p style="font-size:14px;color:#1e40af;">${escapeHtml(batch.session_info || "Session links and materials are shared with your batch.")}</p>
      <a href="${escapeHtml(batch.drive_folder_url)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;">Open Google Drive</a>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;">
      <div style="font-weight:800;color:#14532d;">WhatsApp group</div>
      <p style="font-size:14px;color:#166534;">Join ${escapeHtml(registration.batch_number)} for live session links and mentor updates.</p>
      <a href="${escapeHtml(batch.whatsapp_link)}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 16px;border-radius:10px;font-weight:700;">Join WhatsApp group</a>
    </div>
    <p style="margin-top:20px;">Dates: <strong>${escapeHtml(registration.batch_date)}</strong><br/>Registration: <strong>${escapeHtml(registration.registration_number)}</strong></p>
    <p>Warm regards,<br/><strong>CA Harsh Kaushik</strong></p>`,
  );
  return { subject, html };
}

export function invoiceEmail(registration: Registration) {
  const business = businessDetails();
  const paidOn = registration.paid_at
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(registration.paid_at))
    : "";
  const subject = `Invoice ${registration.invoice_id} — CA Articleship Masterclass`;
  const html = shell(
    "Tax invoice / payment receipt",
    `<p>Dear <strong>${escapeHtml(registration.full_name)}</strong>,</p>
    <p>This is your invoice for the CA Articleship Masterclass.</p>
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:12px;">
      <tr><td style="padding:8px 12px;color:#64748b;">Invoice number</td><td style="padding:8px 12px;text-align:right;font-weight:700;">${escapeHtml(registration.invoice_id)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">Student</td><td style="padding:8px 12px;text-align:right;">${escapeHtml(registration.full_name)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">Email</td><td style="padding:8px 12px;text-align:right;">${escapeHtml(registration.email)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">WhatsApp</td><td style="padding:8px 12px;text-align:right;">${escapeHtml(registration.whatsapp_number)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">Masterclass</td><td style="padding:8px 12px;text-align:right;">${escapeHtml(registration.batch_number)} · ${escapeHtml(registration.batch_name)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">Payment date</td><td style="padding:8px 12px;text-align:right;">${escapeHtml(paidOn)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">Razorpay payment</td><td style="padding:8px 12px;text-align:right;font-family:monospace;">${escapeHtml(registration.razorpay_payment_id)}</td></tr>
      <tr><td style="padding:8px 12px;color:#64748b;">Order</td><td style="padding:8px 12px;text-align:right;font-family:monospace;">${escapeHtml(registration.razorpay_order_id)}</td></tr>
      <tr><td style="padding:8px 12px;font-weight:800;">Amount</td><td style="padding:8px 12px;text-align:right;font-weight:800;color:#15803d;">₹${registration.amount} ${registration.currency}</td></tr>
    </table>
    <p style="font-size:13px;color:#475569;">Billed by ${escapeHtml(business.name)}${business.gstin ? ` · GSTIN ${escapeHtml(business.gstin)}` : ""}<br/>${escapeHtml(business.address)}<br/>${escapeHtml(business.email)} · ${escapeHtml(business.phone)}</p>
    <p style="font-size:12px;color:#64748b;">Fees are non-refundable unless the batch is cancelled by The Umbrella Network.</p>`,
  );
  return { subject, html };
}
