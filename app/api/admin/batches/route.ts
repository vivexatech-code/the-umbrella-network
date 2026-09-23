import { buildBatch } from "@/lib/admin/batch-input";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const store = await getStore();
  return jsonOk({ batches: await store.listAllBatches() });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  try {
    const batch = buildBatch(await request.json());
    const store = await getStore();
    return jsonOk({ batch: await store.saveBatch(batch) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not create the batch.");
  }
}
