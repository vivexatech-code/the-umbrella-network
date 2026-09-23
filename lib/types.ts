export interface Batch {
  id: string;
  batch_number: string;
  name: string;
  start_date: string;
  end_date: string;
  start_at: string;
  end_at: string;
  registration_deadline: string;
  registration_deadline_at: string;
  fee: number;
  whatsapp_link: string;
  drive_folder_id: string;
  drive_folder_url: string;
  session_info: string;
  max_seats: number;
  seats_booked: number;
  status: "active" | "upcoming" | "inactive" | "completed";
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Speaker {
  id: string;
  name: string;
  firm: string;
  domain: string;
  image?: string;
  description: string;
  linkedin_url?: string;
  status: "active" | "inactive";
}

export interface Testimonial {
  id: string;
  student_name: string;
  designation?: string;
  firm?: string;
  domain?: string;
  testimonial: string;
  image?: string;
  linkedin_url?: string;
  status: "published" | "draft";
  created_at: string;
}

export interface LinkedInPost {
  id: string;
  author_name: string;
  avatar_url: string;
  content: string;
  media_url: string;
  profile_url: string;
  post_url: string;
  posted_at: string;
  status: "published" | "hidden";
  created_at: string;
  updated_at: string;
}

export interface StatisticItem {
  id: string;
  number: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
}

export interface WebsiteSettings {
  hero_headline: string;
  hero_subtitle: string;
  statistics: StatisticItem[];
  pricing: {
    fee: number;
    title: string;
    duration: string;
    refund_policy_note: string;
    certificate_included: boolean;
  };
  mentor: {
    name: string;
    title: string;
    quote: string;
    credentials: string[];
    linkedin_url: string;
    image_url?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp_general: string;
    linkedin: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
}

export type PaymentStatus = "created" | "pending" | "paid" | "failed" | "cancelled" | "refunded";
export type SyncStatus = "not_started" | "pending" | "success" | "failed";

export interface Registration {
  id: string;
  registration_number: string;
  invoice_id: string;
  batch_id: string;
  batch_number: string;
  batch_name: string;
  batch_date: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  qualification_level: string;
  attempt_details: string;
  amount: number;
  currency: "INR";
  razorpay_order_id: string;
  razorpay_payment_id: string;
  payment_status: PaymentStatus;
  registration_status: "pending" | "paid" | "failed" | "cancelled";
  webhook_confirmed: boolean;
  drive_access_status: SyncStatus;
  drive_access_error: string;
  sheets_sync_status: SyncStatus;
  sheets_sync_error: string;
  access_email_status: SyncStatus;
  access_email_error: string;
  invoice_email_status: SyncStatus;
  invoice_email_error: string;
  paid_at: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface PaymentSuccessResponse {
  success: boolean;
  message: string;
  registrationId: string;
  registrationNumber: string;
  studentName: string;
  studentEmail?: string;
  batchNumber: string;
  batchName?: string;
  batchDate: string;
  amount: number;
  paymentId: string;
  paymentMethod?: string;
  upiUtr?: string;
  status?: "verified" | "pending_verification" | "rejected";
  requiresVerification?: boolean;
  whatsappLink?: string;
  driveResourcesLink?: string;
  emailSent?: boolean;
  invoiceId?: string;
}

export interface DashboardStats {
  totalStudents: number;
  paidRegistrations: number;
  pendingPayments: number;
  failedPayments: number;
  activeBatches: number;
  expiredBatches: number;
  revenue: number;
  recentRegistrations: Registration[];
}
