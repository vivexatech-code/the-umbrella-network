import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import type { LinkedInPost } from "@/lib/types";
import { z } from "zod";

const schema = z.object({
  author_name: z.string().trim().min(2).max(80),
  avatar_url: z.string().trim().max(500000).optional().default(""),
  content: z.string().trim().min(2).max(3000),
  media_url: z.string().trim().max(500000).optional().default(""),
  profile_url: z.string().trim().optional().default(""),
  post_url: z.string().trim().url("Enter the direct LinkedIn post URL."),
  posted_at: z.string().trim().optional().default(""),
  status: z.enum(["published", "hidden"]).default("published"),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || "Check the LinkedIn post details.");
  const now = new Date().toISOString();
  const post: LinkedInPost = {
    id: `li-${crypto.randomBytes(4).toString("hex")}`,
    ...parsed.data,
    posted_at: parsed.data.posted_at || now,
    created_at: now,
    updated_at: now,
  };
  const store = await getStore();
  return jsonOk({ post: await store.saveLinkedInPost(post) });
}
