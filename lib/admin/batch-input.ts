import crypto from "crypto";
import { driveFolderUrl, extractDriveFolderId, formatBatchDate, formatDeadline, parseAdminDate } from "@/lib/content/format";
import type { Batch } from "@/lib/types";
import { z } from "zod";

const batchSchema = z.object({
  batch_number: z.string().trim().min(2).max(40),
  name: z.string().trim().min(2).max(140),
  start_at: z.string().trim().min(8),
  end_at: z.string().trim().min(8),
  registration_deadline_at: z.string().trim().min(8),
  fee: z.coerce.number().int().positive().max(100000),
  whatsapp_link: z.string().trim().url(),
  drive_folder_url: z.string().trim().optional().default(""),
  session_info: z.string().trim().max(1200).optional().default(""),
  max_seats: z.coerce.number().int().min(1).max(10000),
  status: z.enum(["active", "upcoming", "inactive", "completed"]),
  description: z.string().trim().max(600).optional().default(""),
});

export function buildBatch(input: unknown, existing?: Batch): Batch {
  const parsed = batchSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Check the batch details.");
  }
  const data = parsed.data;
  const startAt = parseAdminDate(data.start_at);
  const endAt = parseAdminDate(data.end_at);
  const deadlineAt = parseAdminDate(data.registration_deadline_at);
  if (Date.parse(endAt) < Date.parse(startAt)) throw new Error("The batch end must be after the start.");
  const folderId = extractDriveFolderId(data.drive_folder_url);
  const now = new Date().toISOString();
  return {
    id: existing?.id || `batch-${crypto.randomBytes(4).toString("hex")}`,
    batch_number: data.batch_number,
    name: data.name,
    start_date: formatBatchDate(startAt),
    end_date: formatBatchDate(endAt),
    start_at: startAt,
    end_at: endAt,
    registration_deadline: formatDeadline(deadlineAt),
    registration_deadline_at: deadlineAt,
    fee: data.fee,
    whatsapp_link: data.whatsapp_link,
    drive_folder_id: folderId,
    drive_folder_url: driveFolderUrl(folderId, data.drive_folder_url),
    session_info: data.session_info,
    max_seats: data.max_seats,
    seats_booked: existing?.seats_booked || 0,
    status: data.status,
    description: data.description,
    created_at: existing?.created_at || now,
    updated_at: now,
  };
}
