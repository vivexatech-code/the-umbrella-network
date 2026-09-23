import "server-only";

import fs from "fs";
import path from "path";
import crypto from "crypto";
import type {
  Batch,
  ContactMessage,
  LinkedInPost,
  Registration,
  Speaker,
  Testimonial,
  WebsiteSettings,
} from "@/lib/types";
import { SEED_BATCHES, SEED_LINKEDIN_POSTS, SEED_SETTINGS, SEED_SPEAKERS, SEED_TESTIMONIALS } from "@/lib/content/seed";
import { publicBatches } from "@/lib/db/public-batch";
import type { MarkPaidResult, Store } from "@/lib/db/types";

interface DataFile {
  batches: Batch[];
  registrations: Registration[];
  speakers: Speaker[];
  testimonials: Testimonial[];
  linkedinPosts: LinkedInPost[];
  settings: WebsiteSettings;
  contacts: ContactMessage[];
  webhookEvents: string[];
}

function seedData(): DataFile {
  return {
    batches: SEED_BATCHES,
    registrations: [],
    speakers: SEED_SPEAKERS,
    testimonials: SEED_TESTIMONIALS,
    linkedinPosts: SEED_LINKEDIN_POSTS,
    settings: SEED_SETTINGS,
    contacts: [],
    webhookEvents: [],
  };
}

export class FileStore implements Store {
  private data: DataFile = seedData();
  private chain: Promise<unknown> = Promise.resolve();
  private filePath = path.join(process.cwd(), ".data", "store.json");
  private memoryOnly = process.env.NETLIFY === "true" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

  async ready(): Promise<void> {
    await this.enqueue(() => {
      this.load();
    });
  }

  private enqueue<T>(fn: () => T): Promise<T> {
    const run = this.chain.then(() => fn());
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private load() {
    if (this.memoryOnly) {
      this.data = seedData();
      return;
    }
    try {
      if (!fs.existsSync(this.filePath)) {
        this.data = seedData();
        this.persist();
        return;
      }
      const parsed = JSON.parse(fs.readFileSync(this.filePath, "utf8")) as Partial<DataFile>;
      this.data = {
        ...seedData(),
        ...parsed,
        batches: Array.isArray(parsed.batches) ? parsed.batches : SEED_BATCHES,
        settings: parsed.settings || SEED_SETTINGS,
        speakers: Array.isArray(parsed.speakers) ? parsed.speakers : SEED_SPEAKERS,
        testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : SEED_TESTIMONIALS,
        linkedinPosts: parsed.linkedinPosts || [],
        registrations: parsed.registrations || [],
        contacts: parsed.contacts || [],
        webhookEvents: parsed.webhookEvents || [],
      };
    } catch (error) {
      console.error("Could not read local data store. Using seed content.", error);
      this.data = seedData();
    }
  }

  private persist() {
    if (this.memoryOnly) return;
    const directory = path.dirname(this.filePath);
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf8");
  }

  async listPublicBatches() {
    return this.enqueue(() => publicBatches(this.data.batches));
  }

  async listAllBatches() {
    return this.enqueue(() => [...this.data.batches]);
  }

  async getBatch(id: string) {
    return this.enqueue(() => this.data.batches.find((batch) => batch.id === id) || null);
  }

  async saveBatch(batch: Batch) {
    return this.enqueue(() => {
      const index = this.data.batches.findIndex((item) => item.id === batch.id);
      if (index === -1) this.data.batches.push(batch);
      else this.data.batches[index] = batch;
      this.persist();
      return batch;
    });
  }

  async deleteBatch(id: string) {
    return this.enqueue(() => {
      const hasPaid = this.data.registrations.some(
        (registration) => registration.batch_id === id && registration.payment_status === "paid",
      );
      if (hasPaid) return false;
      const before = this.data.batches.length;
      this.data.batches = this.data.batches.filter((batch) => batch.id !== id);
      this.persist();
      return this.data.batches.length !== before;
    });
  }

  async getSettings() {
    return this.enqueue(() => this.data.settings);
  }

  async updateSettings(patch: Partial<WebsiteSettings>) {
    return this.enqueue(() => {
      this.data.settings = { ...this.data.settings, ...patch };
      this.persist();
      return this.data.settings;
    });
  }

  async listSpeakers(activeOnly: boolean) {
    return this.enqueue(() => this.data.speakers.filter((speaker) => !activeOnly || speaker.status === "active"));
  }

  async saveSpeaker(speaker: Speaker) {
    return this.enqueue(() => this.upsert(this.data.speakers, speaker));
  }

  async deleteSpeaker(id: string) {
    return this.enqueue(() => this.remove(this.data.speakers, id));
  }

  async listTestimonials(publishedOnly: boolean) {
    return this.enqueue(() =>
      this.data.testimonials.filter((item) => !publishedOnly || item.status === "published"),
    );
  }

  async saveTestimonial(testimonial: Testimonial) {
    return this.enqueue(() => this.upsert(this.data.testimonials, testimonial));
  }

  async deleteTestimonial(id: string) {
    return this.enqueue(() => this.remove(this.data.testimonials, id));
  }

  async listLinkedInPosts(publishedOnly: boolean) {
    return this.enqueue(() =>
      this.data.linkedinPosts
        .filter((post) => !publishedOnly || post.status === "published")
        .sort((a, b) => Date.parse(b.posted_at) - Date.parse(a.posted_at)),
    );
  }

  async saveLinkedInPost(post: LinkedInPost) {
    return this.enqueue(() => this.upsert(this.data.linkedinPosts, post));
  }

  async deleteLinkedInPost(id: string) {
    return this.enqueue(() => this.remove(this.data.linkedinPosts, id));
  }

  async addContact(message: ContactMessage) {
    await this.enqueue(() => {
      this.data.contacts.unshift(message);
      this.persist();
    });
  }

  async listContacts() {
    return this.enqueue(() => [...this.data.contacts]);
  }

  async saveRegistration(registration: Registration) {
    return this.enqueue(() => this.upsert(this.data.registrations, registration));
  }

  async updateRegistration(id: string, patch: Partial<Registration>) {
    return this.enqueue(() => {
      const index = this.data.registrations.findIndex((item) => item.id === id);
      if (index === -1) return null;
      this.data.registrations[index] = {
        ...this.data.registrations[index],
        ...patch,
        updated_at: new Date().toISOString(),
      };
      this.persist();
      return this.data.registrations[index];
    });
  }

  async getRegistration(id: string) {
    return this.enqueue(
      () =>
        this.data.registrations.find((item) => item.id === id || item.registration_number === id) || null,
    );
  }

  async findByOrderId(orderId: string) {
    return this.enqueue(
      () => this.data.registrations.find((item) => item.razorpay_order_id === orderId) || null,
    );
  }

  async findByPaymentId(paymentId: string) {
    return this.enqueue(
      () => this.data.registrations.find((item) => item.razorpay_payment_id === paymentId) || null,
    );
  }

  async findPaidByEmailAndBatch(email: string, batchId: string) {
    return this.enqueue(
      () =>
        this.data.registrations.find(
          (item) =>
            item.email === email.toLowerCase() &&
            item.batch_id === batchId &&
            item.payment_status === "paid",
        ) || null,
    );
  }

  async findReusablePending(email: string, batchId: string) {
    return this.enqueue(() => {
      const cutoff = Date.now() - 2 * 60 * 60 * 1000;
      return (
        [...this.data.registrations]
          .reverse()
          .find(
            (item) =>
              item.email === email.toLowerCase() &&
              item.batch_id === batchId &&
              item.payment_status === "pending" &&
              Date.parse(item.created_at) > cutoff,
          ) || null
      );
    });
  }

  async listRegistrations() {
    return this.enqueue(() => [...this.data.registrations].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
  }

  async markPaid(id: string, paymentId: string, webhookConfirmed: boolean): Promise<MarkPaidResult | null> {
    return this.enqueue(() => {
      const registration = this.data.registrations.find((item) => item.id === id);
      if (!registration) return null;
      if (registration.payment_status === "paid") {
        if (webhookConfirmed && !registration.webhook_confirmed) {
          registration.webhook_confirmed = true;
          registration.updated_at = new Date().toISOString();
          this.persist();
        }
        return { registration, transitioned: false };
      }
      const duplicatePayment = this.data.registrations.find(
        (item) => item.razorpay_payment_id === paymentId && item.id !== registration.id && item.payment_status === "paid",
      );
      if (duplicatePayment) return { registration: duplicatePayment, transitioned: false };

      registration.payment_status = "paid";
      registration.registration_status = "paid";
      registration.razorpay_payment_id = paymentId;
      registration.webhook_confirmed = registration.webhook_confirmed || webhookConfirmed;
      registration.paid_at = new Date().toISOString();
      registration.updated_at = registration.paid_at;
      if (!registration.invoice_id) {
        registration.invoice_id = `UN-INV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      }
      const batch = this.data.batches.find((item) => item.id === registration.batch_id);
      if (batch) batch.seats_booked += 1;
      this.persist();
      return { registration, transitioned: true };
    });
  }

  async markPaymentState(id: string, status: "failed" | "cancelled") {
    return this.enqueue(() => {
      const registration = this.data.registrations.find((item) => item.id === id);
      if (!registration || registration.payment_status === "paid") return registration || null;
      registration.payment_status = status;
      registration.registration_status = status;
      registration.updated_at = new Date().toISOString();
      this.persist();
      return registration;
    });
  }

  async hasWebhookEvent(id: string) {
    return this.enqueue(() => this.data.webhookEvents.includes(id));
  }

  async recordWebhookEvent(id: string) {
    await this.enqueue(() => {
      if (!this.data.webhookEvents.includes(id)) this.data.webhookEvents.push(id);
      if (this.data.webhookEvents.length > 500) {
        this.data.webhookEvents = this.data.webhookEvents.slice(-500);
      }
      this.persist();
    });
  }

  private upsert<T extends { id: string }>(collection: T[], record: T): T {
    const index = collection.findIndex((item) => item.id === record.id);
    if (index === -1) collection.push(record);
    else collection[index] = record;
    this.persist();
    return record;
  }

  private remove<T extends { id: string }>(collection: T[], id: string): boolean {
    const before = collection.length;
    const next = collection.filter((item) => item.id !== id);
    collection.splice(0, collection.length, ...next);
    this.persist();
    return next.length !== before;
  }
}
