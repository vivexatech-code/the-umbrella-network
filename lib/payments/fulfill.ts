import "server-only";

import { getStore } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { accessEmail, invoiceEmail } from "@/lib/email/templates";
import { grantDriveAccess } from "@/lib/google/drive";
import { syncRegistrationToSheet } from "@/lib/google/sheets";

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error";
}

const inflight = new Map<string, Promise<Awaited<ReturnType<typeof fulfillRegistrationInner>>>>();

export function fulfillRegistration(registrationId: string) {
  const existing = inflight.get(registrationId);
  if (existing) return existing;
  const run = fulfillRegistrationInner(registrationId).finally(() => inflight.delete(registrationId));
  inflight.set(registrationId, run);
  return run;
}

async function fulfillRegistrationInner(registrationId: string) {
  const store = await getStore();
  const registration = await store.getRegistration(registrationId);
  if (!registration || registration.payment_status !== "paid") return null;
  const batch = await store.getBatch(registration.batch_id);
  if (!batch) return registration;

  let current = registration;

  if (current.access_email_status !== "success") {
    try {
      const email = accessEmail(current, batch);
      await sendEmail(current.email, email.subject, email.html);
      current = (await store.updateRegistration(current.id, {
        access_email_status: "success",
        access_email_error: "",
      })) || current;
    } catch (error) {
      current = (await store.updateRegistration(current.id, {
        access_email_status: "failed",
        access_email_error: messageOf(error),
      })) || current;
    }
  }

  if (current.drive_access_status !== "success") {
    try {
      await grantDriveAccess(current.email, batch.drive_folder_id);
      current = (await store.updateRegistration(current.id, {
        drive_access_status: "success",
        drive_access_error: "",
      })) || current;
    } catch (error) {
      current = (await store.updateRegistration(current.id, {
        drive_access_status: "failed",
        drive_access_error: messageOf(error),
      })) || current;
    }
  }

  if (current.invoice_email_status !== "success") {
    try {
      const email = invoiceEmail(current);
      await sendEmail(current.email, email.subject, email.html);
      current = (await store.updateRegistration(current.id, {
        invoice_email_status: "success",
        invoice_email_error: "",
      })) || current;
    } catch (error) {
      current = (await store.updateRegistration(current.id, {
        invoice_email_status: "failed",
        invoice_email_error: messageOf(error),
      })) || current;
    }
  }

  if (current.sheets_sync_status !== "success") {
    try {
      await syncRegistrationToSheet(current);
      current = (await store.updateRegistration(current.id, {
        sheets_sync_status: "success",
        sheets_sync_error: "",
      })) || current;
    } catch (error) {
      current = (await store.updateRegistration(current.id, {
        sheets_sync_status: "failed",
        sheets_sync_error: messageOf(error),
      })) || current;
    }
  }

  return current;
}

export async function retryPendingFulfillment() {
  const store = await getStore();
  const registrations = await store.listRegistrations();
  const pending = registrations.filter(
    (registration) =>
      registration.payment_status === "paid" &&
      (registration.access_email_status !== "success" ||
        registration.invoice_email_status !== "success" ||
        registration.drive_access_status !== "success" ||
        registration.sheets_sync_status !== "success"),
  );
  const results = [];
  for (const registration of pending.slice(0, 25)) {
    results.push(await fulfillRegistration(registration.id));
  }
  return results.filter(Boolean).length;
}
