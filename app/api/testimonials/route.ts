import { getStore } from "@/lib/db";
import { jsonOk } from "@/lib/http";

export const revalidate = 60;

export async function GET() {
  const store = await getStore();
  return jsonOk({ testimonials: await store.listTestimonials(true) });
}
