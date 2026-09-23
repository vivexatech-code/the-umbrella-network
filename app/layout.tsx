import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: "Don't just apply everywhere. Build the right strategy for your CA articleship with our 6-day Masterclass.",
  },
  robots: { index: true, follow: true },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "6-Day CA Articleship Masterclass",
  description: siteConfig.description,
  provider: {
    "@type": "Organization",
    name: siteConfig.name,
    sameAs: siteConfig.linkedin,
  },
  offers: {
    "@type": "Offer",
    price: "999",
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "Online",
    duration: "P6D",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${jakarta.variable}`}>
      <body className="bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
