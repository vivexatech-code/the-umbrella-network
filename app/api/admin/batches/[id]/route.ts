import { buildBatch } from "@/lib/admin/batch-input";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  const existing = await store.getBatch(id);
  if (!existing) return jsonError("Batch not found.", 404);
  try {
    const batch = buildBatch(await request.json(), existing);
    return jsonOk({ batch: await store.saveBatch(batch) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not update the batch.");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  const removed = await store.deleteBatch(id);
  if (!removed) return jsonError("Expired or paid batches are kept. Deactivate the batch instead.", 400);
  return jsonOk({ deleted: true });
}
