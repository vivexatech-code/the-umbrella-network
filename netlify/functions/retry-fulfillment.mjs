export default async () => {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("Retry schedule skipped: site URL or CRON_SECRET is missing.");
    return;
  }
  const response = await fetch(new URL("/api/cron/retry-fulfillment", base), {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!response.ok) {
    console.error("Retry schedule failed", response.status);
  }
};

export const config = {
  schedule: "*/10 * * * *",
};
