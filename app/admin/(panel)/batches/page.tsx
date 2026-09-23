import { BatchManager } from "@/components/admin/batch-manager";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const store = await getStore();
  const batches = await store.listAllBatches();
  return <BatchManager batches={batches} />;
}
