import { getStore } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export const revalidate = 30;

export async function GET() {
  const store = await getStore();
  const batches = await store.listPublicBatches();
  return jsonOk({ batches });
}
