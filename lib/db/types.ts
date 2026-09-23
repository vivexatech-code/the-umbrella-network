import type {
  Batch,
  ContactMessage,
  LinkedInPost,
  Registration,
  Speaker,
  Testimonial,
  WebsiteSettings,
} from "@/lib/types";

export interface MarkPaidResult {
  registration: Registration;
  transitioned: boolean;
}

export interface Store {
  ready(): Promise<void>;
  listPublicBatches(): Promise<Batch[]>;
  listAllBatches(): Promise<Batch[]>;
  getBatch(id: string): Promise<Batch | null>;
  saveBatch(batch: Batch): Promise<Batch>;
  deleteBatch(id: string): Promise<boolean>;
  getSettings(): Promise<WebsiteSettings>;
  updateSettings(patch: Partial<WebsiteSettings>): Promise<WebsiteSettings>;
  listSpeakers(activeOnly: boolean): Promise<Speaker[]>;
  saveSpeaker(speaker: Speaker): Promise<Speaker>;
  deleteSpeaker(id: string): Promise<boolean>;
  listTestimonials(publishedOnly: boolean): Promise<Testimonial[]>;
  saveTestimonial(testimonial: Testimonial): Promise<Testimonial>;
  deleteTestimonial(id: string): Promise<boolean>;
  listLinkedInPosts(publishedOnly: boolean): Promise<LinkedInPost[]>;
  saveLinkedInPost(post: LinkedInPost): Promise<LinkedInPost>;
  deleteLinkedInPost(id: string): Promise<boolean>;
  addContact(message: ContactMessage): Promise<void>;
  listContacts(): Promise<ContactMessage[]>;
  saveRegistration(registration: Registration): Promise<Registration>;
  updateRegistration(id: string, patch: Partial<Registration>): Promise<Registration | null>;
  getRegistration(id: string): Promise<Registration | null>;
  findByOrderId(orderId: string): Promise<Registration | null>;
  findByPaymentId(paymentId: string): Promise<Registration | null>;
  findPaidByEmailAndBatch(email: string, batchId: string): Promise<Registration | null>;
  findReusablePending(email: string, batchId: string): Promise<Registration | null>;
  listRegistrations(): Promise<Registration[]>;
  markPaid(id: string, paymentId: string, webhookConfirmed: boolean): Promise<MarkPaidResult | null>;
  markPaymentState(id: string, status: "failed" | "cancelled"): Promise<Registration | null>;
  hasWebhookEvent(id: string): Promise<boolean>;
  recordWebhookEvent(id: string): Promise<void>;
}
