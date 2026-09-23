import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  await store.deleteLinkedInPost(id);
  return jsonOk({ deleted: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const store = await getStore();
  const posts = await store.listLinkedInPosts(false);
  const existing = posts.find((post) => post.id === id);
  if (!existing) return jsonError("Post not found.", 404);
  const body = (await request.json().catch(() => ({}))) as Partial<typeof existing>;
  const post = await store.saveLinkedInPost({
    ...existing,
    ...body,
    id: existing.id,
    created_at: existing.created_at,
    updated_at: new Date().toISOString(),
  });
  return jsonOk({ post });
}
