export const siteConfig = {
  name: "The Umbrella Network",
  title: "Articleship Masterclass | The Umbrella Network",
  description:
    "A practical 6-day Articleship Masterclass for CA students covering CV building, applications, domain selection, interviews, LinkedIn, HR communication and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://umbrellanetwork.in",
  /** Single source for the Join Masterclass popup interval. */
  joinPopupIntervalMs: Number(process.env.NEXT_PUBLIC_JOIN_POPUP_INTERVAL_MS || 3 * 60 * 1000),
  contactEmail: "caumbrellanetwork@gmail.com",
  contactPhone: "+91 9996506041",
  linkedin: "https://www.linkedin.com/in/ca-harsh-kaushik/",
};
