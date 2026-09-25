import { CheckCircle2, Linkedin } from 'lucide-react';
import type { WebsiteSettings } from '@/lib/types';
import { JoinButton } from '@/components/site/join-button';

interface MentorSectionProps {
  mentorData?: WebsiteSettings['mentor'];
}

export function MentorSection({ mentorData }: MentorSectionProps) {
  const credentials = (mentorData?.credentials || [
    'Qualified CA in first attempt',
    'Articleship at PwC',
    'Industrial Training at Flipkart',
    'Former Assistant Manager at Deloitte',
  ])
    .filter((credential) => !/AIR\s*24/i.test(credential))
    .map((credential) => (/articleship at flipkart/i.test(credential) ? 'Industrial Training at Flipkart' : credential));
  const photoUrl = '/ca-harsh.jpg';

  return (
    <section id="mentor" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-blue-500/40 shadow-xl bg-slate-800 relative">
                  <img src={photoUrl} alt="CA Harsh Kaushik" className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-blue-300 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                      Founder & Lead Mentor
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{mentorData?.name || 'CA Harsh Kaushik'}</h3>
              <p className="text-xs sm:text-sm text-blue-300 font-medium mt-1">
                {mentorData?.title || 'Chartered Accountant | Articleship & Career Mentor'}
              </p>
              <a
                href={mentorData?.linkedin_url || 'https://www.linkedin.com/in/ca-harsh-kaushik/'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/20">
                  <span>Meet Your Mentor</span>
                </div>
                <blockquote className="text-lg sm:text-xl text-slate-200 font-normal italic leading-relaxed border-l-2 border-blue-500 pl-4 py-1">
                  “{mentorData?.quote || "I created this masterclass because I remember how confusing the articleship search can be when you don't know where to start, how to approach firms, or how to present yourself."}”
                </blockquote>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Harsh has guided hundreds of CA aspirants through the nuances of resume structuring, domain positioning, and partner interview dynamics. Having trained at both PwC and Flipkart and worked at Deloitte, his advice is anchored strictly in corporate reality.
                </p>
                <div className="pt-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">Verified Credentials</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {credentials.map((credential) => (
                      <div key={credential} className="flex items-center gap-2.5 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{credential}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400">Direct live interaction & personalized Q&A during all 6 days.</div>
                <JoinButton
                  id="mentor-cta-learn-with-me"
                  label="Learn With Me"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
