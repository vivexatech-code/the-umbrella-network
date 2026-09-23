import type { Batch } from "@/lib/types";
import { isRegistrationOpen } from "@/lib/batches/availability";

export function toPublicBatch(batch: Batch): Batch {
  return {
    ...batch,
    whatsapp_link: "",
    drive_folder_id: "",
    drive_folder_url: "",
    session_info: "",
  };
}

export function publicBatches(batches: Batch[]): Batch[] {
  return batches
    .filter((batch) => isRegistrationOpen(batch))
    .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at))
    .map(toPublicBatch);
}
