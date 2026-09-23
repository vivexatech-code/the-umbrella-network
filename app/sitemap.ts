import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteConfig.url, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${siteConfig.url}/#modules`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/#roadmap`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/#mentor`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/#pricing`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/#faqs`, lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
