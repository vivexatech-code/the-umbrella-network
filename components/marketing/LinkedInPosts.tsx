import { ExternalLink, Linkedin } from 'lucide-react';
import type { LinkedInPost } from '@/lib/types';

export function LinkedInPosts({ posts }: { posts: LinkedInPost[] }) {
  if (posts.length === 0) return null;
  return (
    <section id="linkedin-posts" className="py-20 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Linkedin className="w-3.5 h-3.5" />
            <span>Students on LinkedIn</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">What Students Posted</h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">Notes students shared publicly about the masterclass.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 border border-blue-200 shrink-0">
                  {post.avatar_url ? (
                    <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-800 font-bold text-sm">
                      {post.author_name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{post.author_name}</h3>
                  <p className="text-[11px] text-slate-500">{new Date(post.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
              {post.media_url && (
                <img src={post.media_url} alt="" className="mt-4 w-full rounded-xl object-cover max-h-64 border border-slate-200" />
              )}
              <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900">
                <Linkedin className="w-3.5 h-3.5" />
                <span>View LinkedIn Post</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
