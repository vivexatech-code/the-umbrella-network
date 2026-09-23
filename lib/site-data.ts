import "server-only";

import { isBatchExpired, isRegistrationOpen } from "@/lib/batches/availability";
import { getStore } from "@/lib/db";
import type { DashboardStats } from "@/lib/types";

export async function getHomeData() {
  const store = await getStore();
  const [batches, settings, speakers, testimonials, posts] = await Promise.all([
    store.listPublicBatches(),
    store.getSettings(),
    store.listSpeakers(true),
    store.listTestimonials(true),
    store.listLinkedInPosts(true),
  ]);
  const activeBatch = batches.find((batch) => batch.status === "active") || batches[0] || null;
  return { batches, activeBatch, settings, speakers, testimonials, posts };
}

export async function getDashboard(): Promise<DashboardStats> {
  const store = await getStore();
  const [registrations, batches] = await Promise.all([store.listRegistrations(), store.listAllBatches()]);
  const paid = registrations.filter((item) => item.payment_status === "paid");
  return {
    totalStudents: registrations.length,
    paidRegistrations: paid.length,
    pendingPayments: registrations.filter((item) => item.payment_status === "pending").length,
    failedPayments: registrations.filter((item) => item.payment_status === "failed" || item.payment_status === "cancelled").length,
    activeBatches: batches.filter((batch) => isRegistrationOpen(batch)).length,
    expiredBatches: batches.filter((batch) => isBatchExpired(batch)).length,
    revenue: paid.reduce((sum, item) => sum + item.amount, 0),
    recentRegistrations: registrations.slice(0, 8),
  };
}
