import "server-only";

import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SEED_BATCHES, SEED_LINKEDIN_POSTS, SEED_SETTINGS, SEED_SPEAKERS, SEED_TESTIMONIALS } from "@/lib/content/seed";
import { publicBatches } from "@/lib/db/public-batch";
import { createSupabaseAdmin } from "@/lib/db/supabase";
import type { MarkPaidResult, Store } from "@/lib/db/types";
import type {
  Batch,
  ContactMessage,
  LinkedInPost,
  Registration,
  Speaker,
  Testimonial,
  WebsiteSettings,
} from "@/lib/types";

function assertOk(error: { message: string } | null, action: string) {
  if (error) throw new Error(`${action}: ${error.message}`);
}

function registrationFrom(row: Registration): Registration {
  return {
    ...row,
    attempt_details: row.attempt_details || "",
    invoice_id: row.invoice_id || "",
    razorpay_order_id: row.razorpay_order_id || "",
    razorpay_payment_id: row.razorpay_payment_id || "",
    paid_at: row.paid_at || "",
    drive_access_error: row.drive_access_error || "",
    sheets_sync_error: row.sheets_sync_error || "",
    access_email_error: row.access_email_error || "",
    invoice_email_error: row.invoice_email_error || "",
  };
}

export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor() {
    this.db = createSupabaseAdmin();
  }

  async ready() {
    const existing = await this.db.from("site_settings").select("id").eq("id", "site").maybeSingle();
    assertOk(existing.error, "Could not read site settings");
    if (existing.data) return;
    const batches = await this.db.from("batches").insert(SEED_BATCHES);
    assertOk(batches.error, "Could not seed batches");
    const speakers = await this.db.from("speakers").insert(SEED_SPEAKERS);
    assertOk(speakers.error, "Could not seed speakers");
    const testimonials = await this.db.from("testimonials").insert(SEED_TESTIMONIALS);
    assertOk(testimonials.error, "Could not seed testimonials");
    if (SEED_LINKEDIN_POSTS.length) {
      const posts = await this.db.from("linkedin_posts").insert(SEED_LINKEDIN_POSTS);
      assertOk(posts.error, "Could not seed LinkedIn posts");
    }
    const settings = await this.db.from("site_settings").insert({ id: "site", data: SEED_SETTINGS });
    assertOk(settings.error, "Could not seed settings");
  }

  async listPublicBatches() {
    return publicBatches(await this.listAllBatches());
  }

  async listAllBatches() {
    const result = await this.db.from("batches").select("*").order("start_at", { ascending: true });
    assertOk(result.error, "Could not list batches");
    return (result.data || []) as Batch[];
  }

  async getBatch(id: string) {
    const result = await this.db.from("batches").select("*").eq("id", id).maybeSingle();
    assertOk(result.error, "Could not load batch");
    return (result.data as Batch | null) || null;
  }

  async saveBatch(batch: Batch) {
    const result = await this.db.from("batches").upsert(batch).select("*").single();
    assertOk(result.error, "Could not save batch");
    return result.data as Batch;
  }

  async deleteBatch(id: string) {
    const paid = await this.db
      .from("registrations")
      .select("id")
      .eq("batch_id", id)
      .eq("payment_status", "paid")
      .limit(1);
    assertOk(paid.error, "Could not check batch registrations");
    if (paid.data && paid.data.length > 0) return false;
    const result = await this.db.from("batches").delete().eq("id", id);
    assertOk(result.error, "Could not delete batch");
    return true;
  }

  async getSettings() {
    const result = await this.db.from("site_settings").select("data").eq("id", "site").maybeSingle();
    assertOk(result.error, "Could not load settings");
    return (result.data?.data as WebsiteSettings) || SEED_SETTINGS;
  }

  async updateSettings(patch: Partial<WebsiteSettings>) {
    const next = { ...(await this.getSettings()), ...patch };
    const result = await this.db.from("site_settings").upsert({ id: "site", data: next });
    assertOk(result.error, "Could not save settings");
    return next;
  }

  async listSpeakers(activeOnly: boolean) {
    let query = this.db.from("speakers").select("*");
    if (activeOnly) query = query.eq("status", "active");
    const result = await query;
    assertOk(result.error, "Could not list speakers");
    return (result.data || []) as Speaker[];
  }

  async saveSpeaker(speaker: Speaker) {
    const result = await this.db.from("speakers").upsert(speaker).select("*").single();
    assertOk(result.error, "Could not save speaker");
    return result.data as Speaker;
  }

  async deleteSpeaker(id: string) {
    const result = await this.db.from("speakers").delete().eq("id", id);
    assertOk(result.error, "Could not delete speaker");
    return true;
  }

  async listTestimonials(publishedOnly: boolean) {
    let query = this.db.from("testimonials").select("*");
    if (publishedOnly) query = query.eq("status", "published");
    const result = await query;
    assertOk(result.error, "Could not list testimonials");
    return (result.data || []) as Testimonial[];
  }

  async saveTestimonial(testimonial: Testimonial) {
    const result = await this.db.from("testimonials").upsert(testimonial).select("*").single();
    assertOk(result.error, "Could not save testimonial");
    return result.data as Testimonial;
  }

  async deleteTestimonial(id: string) {
    const result = await this.db.from("testimonials").delete().eq("id", id);
    assertOk(result.error, "Could not delete testimonial");
    return true;
  }

  async listLinkedInPosts(publishedOnly: boolean) {
    let query = this.db.from("linkedin_posts").select("*").order("posted_at", { ascending: false });
    if (publishedOnly) query = query.eq("status", "published");
    const result = await query;
    assertOk(result.error, "Could not list LinkedIn posts");
    return (result.data || []) as LinkedInPost[];
  }

  async saveLinkedInPost(post: LinkedInPost) {
    const result = await this.db.from("linkedin_posts").upsert(post).select("*").single();
    assertOk(result.error, "Could not save LinkedIn post");
    return result.data as LinkedInPost;
  }

  async deleteLinkedInPost(id: string) {
    const result = await this.db.from("linkedin_posts").delete().eq("id", id);
    assertOk(result.error, "Could not delete LinkedIn post");
    return true;
  }

  async addContact(message: ContactMessage) {
    const result = await this.db.from("contact_messages").insert(message);
    assertOk(result.error, "Could not save message");
  }

  async listContacts() {
    const result = await this.db.from("contact_messages").select("*").order("created_at", { ascending: false });
    assertOk(result.error, "Could not list messages");
    return (result.data || []) as ContactMessage[];
  }

  async saveRegistration(registration: Registration) {
    const result = await this.db.from("registrations").upsert(this.registrationRow(registration)).select("*").single();
    assertOk(result.error, "Could not save registration");
    await this.syncPayment(registrationFrom(result.data as Registration));
    return registrationFrom(result.data as Registration);
  }

  async updateRegistration(id: string, patch: Partial<Registration>) {
    const result = await this.db
      .from("registrations")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*")
      .maybeSingle();
    assertOk(result.error, "Could not update registration");
    if (!result.data) return null;
    const registration = registrationFrom(result.data as Registration);
    await this.syncPayment(registration);
    return registration;
  }

  async getRegistration(id: string) {
    const byId = await this.db.from("registrations").select("*").eq("id", id).maybeSingle();
    assertOk(byId.error, "Could not load registration");
    if (byId.data) return registrationFrom(byId.data as Registration);
    const byNumber = await this.db.from("registrations").select("*").eq("registration_number", id).maybeSingle();
    assertOk(byNumber.error, "Could not load registration");
    return byNumber.data ? registrationFrom(byNumber.data as Registration) : null;
  }

  async findByOrderId(orderId: string) {
    if (!orderId) return null;
    const result = await this.db.from("registrations").select("*").eq("razorpay_order_id", orderId).maybeSingle();
    assertOk(result.error, "Could not find order");
    return result.data ? registrationFrom(result.data as Registration) : null;
  }

  async findByPaymentId(paymentId: string) {
    if (!paymentId) return null;
    const result = await this.db.from("registrations").select("*").eq("razorpay_payment_id", paymentId).maybeSingle();
    assertOk(result.error, "Could not find payment");
    return result.data ? registrationFrom(result.data as Registration) : null;
  }

  async findPaidByEmailAndBatch(email: string, batchId: string) {
    const result = await this.db
      .from("registrations")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("batch_id", batchId)
      .eq("payment_status", "paid")
      .maybeSingle();
    assertOk(result.error, "Could not check existing registration");
    return result.data ? registrationFrom(result.data as Registration) : null;
  }

  async findReusablePending(email: string, batchId: string) {
    const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = await this.db
      .from("registrations")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("batch_id", batchId)
      .eq("payment_status", "pending")
      .gt("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    assertOk(result.error, "Could not find pending registration");
    return result.data ? registrationFrom(result.data as Registration) : null;
  }

  async listRegistrations() {
    const result = await this.db.from("registrations").select("*").order("created_at", { ascending: false });
    assertOk(result.error, "Could not list registrations");
    return ((result.data || []) as Registration[]).map(registrationFrom);
  }

  async markPaid(id: string, paymentId: string, webhookConfirmed: boolean): Promise<MarkPaidResult | null> {
    const current = await this.getRegistration(id);
    if (!current) return null;
    if (current.payment_status === "paid") {
      if (webhookConfirmed && !current.webhook_confirmed) {
        const updated = await this.updateRegistration(id, { webhook_confirmed: true });
        return { registration: updated || current, transitioned: false };
      }
      return { registration: current, transitioned: false };
    }
    const duplicate = await this.findByPaymentId(paymentId);
    if (duplicate && duplicate.id !== current.id && duplicate.payment_status === "paid") {
      return { registration: duplicate, transitioned: false };
    }
    const paidAt = new Date().toISOString();
    const invoiceId =
      current.invoice_id || `UN-INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const result = await this.db
      .from("registrations")
      .update({
        payment_status: "paid",
        registration_status: "paid",
        razorpay_payment_id: paymentId,
        webhook_confirmed: current.webhook_confirmed || webhookConfirmed,
        paid_at: paidAt,
        updated_at: paidAt,
        invoice_id: invoiceId,
      })
      .eq("id", id)
      .eq("payment_status", "pending")
      .select("*")
      .maybeSingle();
    assertOk(result.error, "Could not mark registration paid");
    if (!result.data) {
      const again = await this.getRegistration(id);
      return again ? { registration: again, transitioned: false } : null;
    }
    const registration = registrationFrom(result.data as Registration);
    const seats = await this.db.rpc("increment_batch_seats", { p_batch_id: registration.batch_id });
    if (seats.error) console.error("Seat count was not incremented", seats.error.message);
    await this.syncPayment(registration);
    return { registration, transitioned: true };
  }

  async markPaymentState(id: string, status: "failed" | "cancelled") {
    const current = await this.getRegistration(id);
    if (!current || current.payment_status === "paid") return current;
    return this.updateRegistration(id, { payment_status: status, registration_status: status });
  }

  async hasWebhookEvent(id: string) {
    const result = await this.db.from("webhook_events").select("id").eq("id", id).maybeSingle();
    assertOk(result.error, "Could not read webhook event");
    return Boolean(result.data);
  }

  async recordWebhookEvent(id: string) {
    const result = await this.db.from("webhook_events").upsert({ id });
    assertOk(result.error, "Could not store webhook event");
  }

  private registrationRow(registration: Registration) {
    return {
      ...registration,
      paid_at: registration.paid_at || null,
    };
  }

  private async syncPayment(registration: Registration) {
    if (!registration.razorpay_order_id && !registration.razorpay_payment_id) return;
    const result = await this.db.from("payments").upsert({
      id: `payrow-${registration.id}`,
      registration_id: registration.id,
      razorpay_order_id: registration.razorpay_order_id,
      razorpay_payment_id: registration.razorpay_payment_id,
      amount: registration.amount,
      currency: registration.currency,
      status: registration.payment_status,
      payment_method: registration.razorpay_order_id.startsWith("order_dev_") ? "development" : "razorpay",
      updated_at: new Date().toISOString(),
    });
    if (result.error) console.error("Payment row was not saved", result.error.message);
  }
}
