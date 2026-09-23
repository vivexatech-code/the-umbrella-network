import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  await store.deleteTestimonial(id);
  return jsonOk({ deleted: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  const items = await store.listTestimonials(false);
  const existing = items.find((item) => item.id === id);
  if (!existing) return jsonError("Testimonial not found.", 404);
  const body = (await request.json().catch(() => ({}))) as Partial<typeof existing>;
  const testimonial = await store.saveTestimonial({
    ...existing,
    ...body,
    id: existing.id,
    created_at: existing.created_at,
  });
  return jsonOk({ testimonial });
}
