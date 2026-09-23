import { TestimonialManager } from "@/components/admin/content-managers";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  const store = await getStore();
  const testimonials = await store.listTestimonials(false);
  return <TestimonialManager testimonials={testimonials} />;
}
