'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Linkedin } from 'lucide-react';
import type { LinkedInPost } from '@/lib/types';

const GAP = 24;
const SLIDE_MS = 650;
const AUTO_MS = 4200;

function cardsPerView(width: number) {
  if (width >= 1024) return 3;
  if (width >= 768) return 2;
  return 1;
}

function PostCard({ post }: { post: LinkedInPost }) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[28rem] overflow-hidden">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 border border-blue-200 shrink-0">
          {post.avatar_url ? (
            <img src={post.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-800 font-bold text-sm">
              {post.author_name
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 truncate">{post.author_name}</h3>
          <p className="text-[11px] text-slate-500">
            {new Date(post.posted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 shrink-0">{post.content}</p>
      <div className={`mt-4 h-40 shrink-0 overflow-hidden rounded-xl ${post.media_url ? 'border border-slate-200' : ''}`}>
        {post.media_url ? <img src={post.media_url} alt="" className="h-full w-full object-cover" /> : null}
      </div>
      <a
        href={post.post_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto pt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 shrink-0"
      >
        <Linkedin className="w-3.5 h-3.5" />
        <span>View LinkedIn Post</span>
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    </article>
  );
}

export function LinkedInPosts({ posts }: { posts: LinkedInPost[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const rewinding = useRef(false);
  const [perView, setPerView] = useState(3);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const canSlide = posts.length > perView;
  const slides = canSlide ? [...posts, ...posts.slice(0, perView)] : posts;
  const slideWidth = viewportWidth > 0 ? (viewportWidth - GAP * (perView - 1)) / perView : 0;

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      setViewportWidth(viewport.clientWidth);
      setPerView(cardsPerView(window.innerWidth));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    setAnimate(false);
    setIndex(0);
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, [perView, posts.length]);

  useEffect(() => {
    if (!canSlide || paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => (current >= posts.length ? current : current + 1));
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [canSlide, paused, reduceMotion, posts.length]);

  useEffect(() => {
    if (!canSlide || index < posts.length || rewinding.current) return;
    const timeout = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, SLIDE_MS);
    return () => window.clearTimeout(timeout);
  }, [canSlide, index, posts.length]);

  if (posts.length === 0) return null;

  const step = (direction: 1 | -1) => {
    if (!canSlide) return;
    if (direction === 1) {
      setAnimate(true);
      setIndex((current) => (current >= posts.length ? current : current + 1));
      return;
    }
    if (index === 0) {
      rewinding.current = true;
      setAnimate(false);
      setIndex(posts.length);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setAnimate(true);
          setIndex(posts.length - 1);
          rewinding.current = false;
        });
      });
      return;
    }
    setAnimate(true);
    setIndex((current) => current - 1);
  };

  return (
    <section id="linkedin-posts" className="py-20 bg-slate-50 border-b border-slate-200/80 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Linkedin className="w-3.5 h-3.5" />
            <span>Students on LinkedIn</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">What Students Posted</h2>
          <p className="text-base sm:text-lg text-slate-600 mt-3">Notes students shared publicly about the masterclass.</p>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="What students posted"
          onMouseEnter={() => {
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) setPaused(true);
          }}
          onMouseLeave={() => setPaused(false)}
        >
        <div
          ref={viewportRef}
          className="overflow-hidden"
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
            setPaused(true);
          }}
          onTouchEnd={(event) => {
            const start = touchStartX.current;
            touchStartX.current = null;
            const end = event.changedTouches[0]?.clientX;
            if (start != null && end != null) {
              const delta = end - start;
              if (delta > 48) step(-1);
              else if (delta < -48) step(1);
            }
            setPaused(false);
          }}
        >
          <div
            className="flex items-stretch"
            style={{
              gap: GAP,
              transform: `translate3d(-${index * (slideWidth + GAP)}px, 0, 0)`,
              transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
            }}
          >
            {slides.map((post, slideIndex) => (
              <div key={`${post.id}-${slideIndex}`} className="min-w-0 shrink-0" style={{ width: slideWidth > 0 ? slideWidth : undefined }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>

        {canSlide && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
              aria-label="Previous posts"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
              aria-label="Next posts"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
