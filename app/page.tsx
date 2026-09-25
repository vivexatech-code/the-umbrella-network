import { ContactSection } from "@/components/marketing/ContactSection";
import { CurrentBatchBanner } from "@/components/marketing/CurrentBatchBanner";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Footer } from "@/components/marketing/Footer";
import { Hero } from "@/components/marketing/Hero";
import { LinkedInPosts } from "@/components/marketing/LinkedInPosts";
import { MentorSection } from "@/components/marketing/MentorSection";
import { MobileStickyCta } from "@/components/marketing/MobileStickyCta";
import { Navbar } from "@/components/marketing/Navbar";
import { Pricing } from "@/components/marketing/Pricing";
import { Roadmap } from "@/components/marketing/Roadmap";
import { SocialProofResults } from "@/components/marketing/SocialProofResults";
import { StudentSpeakers } from "@/components/marketing/StudentSpeakers";
import { Testimonials } from "@/components/marketing/Testimonials";
import { TrustStats } from "@/components/marketing/TrustStats";
import { WhatYouWillLearn } from "@/components/marketing/WhatYouWillLearn";
import { WhyArticleshipDifficult } from "@/components/marketing/WhyArticleshipDifficult";
import { WhyThisMasterclass } from "@/components/marketing/WhyThisMasterclass";
import { RegistrationProvider } from "@/components/site/registration-context";
import { SiteOverlays } from "@/components/site/site-overlays";
import { getHomeData } from "@/lib/site-data";

export const revalidate = 30;

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <RegistrationProvider batches={data.batches} activeBatch={data.activeBatch}>
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
        <Navbar activeBatch={data.activeBatch} />
        <main className="pb-24 lg:pb-0">
          <Hero activeBatch={data.activeBatch} />
          <TrustStats statistics={data.settings.statistics} />
          <CurrentBatchBanner batches={data.batches} activeBatch={data.activeBatch} />
          <MentorSection mentorData={data.settings.mentor} />
          <LinkedInPosts posts={data.posts} />
          <WhyArticleshipDifficult />
          <Roadmap />
          <WhatYouWillLearn />
          <SocialProofResults />
          <Testimonials testimonials={data.testimonials} />
          <Pricing activeBatch={data.activeBatch} pricingSettings={data.settings.pricing} />
          <FaqSection faqs={data.settings.faqs} />
          <ContactSection contactSettings={data.settings.contact} />
          <FinalCta activeBatch={data.activeBatch} />
        </main>
        <Footer />
        <MobileStickyCta activeBatch={data.activeBatch} />
        <SiteOverlays />
      </div>
    </RegistrationProvider>
  );
}
