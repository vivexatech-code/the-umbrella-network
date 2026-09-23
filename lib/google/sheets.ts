import "server-only";

import { google } from "googleapis";
import { googleAuth } from "@/lib/google/auth";
import type { Registration } from "@/lib/types";

const HEADERS = [
  "Registration ID",
  "Student name",
  "Email",
  "WhatsApp number",
  "Qualification level",
  "Attempt details",
  "Batch",
  "Amount",
  "Payment status",
  "Razorpay order ID",
  "Razorpay payment ID",
  "Invoice ID",
  "Registration date",
];

export async function syncRegistrationToSheet(registration: Registration) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEETS_ID;
  if (!spreadsheetId) throw new Error("Google Sheets is not configured.");
  const auth = googleAuth(["https://www.googleapis.com/auth/spreadsheets"]);
  if (!auth) throw new Error("Google service account is not configured.");
  const sheets = google.sheets({ version: "v4", auth });
  const tab = process.env.GOOGLE_SHEETS_TAB || "Registrations";
  const headerRange = `${tab}!A1:M1`;
  const existing = await sheets.spreadsheets.values.get({ spreadsheetId, range: headerRange });
  const first = existing.data.values?.[0]?.[0];
  if (!first) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:M`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        registration.registration_number,
        registration.full_name,
        registration.email,
        registration.whatsapp_number,
        registration.qualification_level,
        registration.attempt_details,
        `${registration.batch_number} — ${registration.batch_name}`,
        registration.amount,
        registration.payment_status,
        registration.razorpay_order_id,
        registration.razorpay_payment_id,
        registration.invoice_id,
        registration.paid_at || registration.created_at,
      ]],
    },
  });
}
