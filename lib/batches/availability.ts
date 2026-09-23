import type { Batch } from "@/lib/types";

export function isBatchExpired(batch: Pick<Batch, "registration_deadline_at">, now = Date.now()): boolean {
  const deadline = Date.parse(batch.registration_deadline_at);
  return !Number.isFinite(deadline) || deadline <= now;
}

export function isRegistrationOpen(batch: Batch, now = Date.now()): boolean {
  if (batch.status === "inactive" || batch.status === "completed") return false;
  if (isBatchExpired(batch, now)) return false;
  if (batch.max_seats > 0 && batch.seats_booked >= batch.max_seats) return false;
  return batch.status === "active" || batch.status === "upcoming";
}

export function adminBatchLabel(batch: Batch, now = Date.now()): string {
  if (batch.status === "inactive") return "Inactive";
  if (batch.status === "completed") return "Completed";
  if (isBatchExpired(batch, now)) return "Expired";
  if (batch.max_seats > 0 && batch.seats_booked >= batch.max_seats) return "Full";
  return batch.status === "upcoming" ? "Upcoming" : "Active";
}
