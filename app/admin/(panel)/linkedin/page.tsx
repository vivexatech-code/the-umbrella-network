import { LinkedInManager } from "@/components/admin/content-managers";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function LinkedInAdminPage() {
  const store = await getStore();
  const posts = await store.listLinkedInPosts(false);
  return <LinkedInManager posts={posts} />;
}
