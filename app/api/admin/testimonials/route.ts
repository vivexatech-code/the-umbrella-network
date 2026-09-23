import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/guard";
import { getStore } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import type { Testimonial } from "@/lib/types";
import { z } from "zod";

const schema = z.object({
  student_name: z.string().trim().min(2).max(80),
  designation: z.string().trim().max(80).optional().default("Articleship Trainee"),
  firm: z.string().trim().max(80).optional().default(""),
  domain: z.string().trim().max(80).optional().default(""),
  testimonial: z.string().trim().min(10).max(1200),
  status: z.enum(["published", "draft"]).default("published"),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Name and testimonial text are required.");
  const testimonial: Testimonial = {
    id: `test-${crypto.randomBytes(4).toString("hex")}`,
    ...parsed.data,
    created_at: new Date().toISOString(),
  };
  const store = await getStore();
  return jsonOk({ testimonial: await store.saveTestimonial(testimonial) });
}
