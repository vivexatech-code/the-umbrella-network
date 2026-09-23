import { Compass, ExternalLink, Linkedin, Sparkles } from 'lucide-react';
import type { Speaker } from '@/lib/types';

const FALLBACK = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

export function StudentSpeakers({ speakers = [] }: { speakers?: Speaker[] }) {
  return (
    <section id="speakers" className="py-20 bg-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peer Mentorship & Guest Sessions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Learn From Students Who Have Been Through It.</h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">
            Connect with recent articleship achievers who sat where you are sitting today, prepared strategically, and successfully cracked Big 4 & Big 6 firms.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {speakers.map((speaker) => (
            <div key={speaker.id} className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-slate-300 shrink-0">
                    <img src={speaker.image || FALLBACK} alt={speaker.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{speaker.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">{speaker.firm}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                    <Compass className="w-3 h-3 text-blue-600" />
                    <span>{speaker.domain}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{speaker.description}</p>
              </div>
              {speaker.linkedin_url && (
                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  <a href={speaker.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors">
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>View LinkedIn Profile</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
