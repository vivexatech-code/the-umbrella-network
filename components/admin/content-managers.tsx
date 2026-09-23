'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LinkedInPost, Testimonial } from '@/lib/types';

async function readImage(file: File) {
  if (file.size > 350_000) throw new Error('Use an image under 350 KB, or paste an image URL.');
  const data = await file.arrayBuffer();
  const bytes = new Uint8Array(data);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:${file.type};base64,${btoa(binary)}`;
}

export function LinkedInManager({ posts }: { posts: LinkedInPost[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">LinkedIn posts</h1>
      {message && <p className="text-sm bg-slate-900 text-white rounded-xl px-3 py-2">{message}</p>}
      <form
        className="bg-white border border-slate-200 rounded-2xl p-4 grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          try {
            const avatarFile = form.get('avatar_file');
            const mediaFile = form.get('media_file');
            let avatar = String(form.get('avatar_url') || '');
            let media = String(form.get('media_url') || '');
            if (avatarFile instanceof File && avatarFile.size > 0) avatar = await readImage(avatarFile);
            if (mediaFile instanceof File && mediaFile.size > 0) media = await readImage(mediaFile);
            const response = await fetch('/api/admin/linkedin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                author_name: form.get('author_name'),
                avatar_url: avatar,
                content: form.get('content'),
                media_url: media,
                profile_url: form.get('profile_url'),
                post_url: form.get('post_url'),
                posted_at: form.get('posted_at'),
                status: form.get('status'),
              }),
            });
            const data = (await response.json()) as { error?: string };
            setMessage(data.error || 'Post saved.');
            if (response.ok) {
              event.currentTarget.reset();
              router.refresh();
            }
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not save the post.');
          }
        }}
      >
        <input name="author_name" required placeholder="Student name" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <textarea name="content" required placeholder="Post content" className="border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-24" />
        <input name="post_url" required type="url" placeholder="Direct LinkedIn post URL" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <input name="profile_url" type="url" placeholder="LinkedIn profile URL (optional)" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <input name="avatar_url" placeholder="Profile picture URL" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <input name="avatar_file" type="file" accept="image/*" className="text-sm" />
        <input name="media_url" placeholder="Post image URL" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <input name="media_file" type="file" accept="image/*" className="text-sm" />
        <input name="posted_at" type="date" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <select name="status" className="border border-slate-300 rounded-xl px-3 py-2 text-sm">
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
        <button className="bg-blue-600 text-white font-bold rounded-xl py-3">Add post</button>
      </form>
      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-bold">{post.author_name}</div>
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">{post.content}</p>
                <a href={post.post_url} className="text-xs font-semibold text-blue-700" target="_blank" rel="noreferrer">Open post</a>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-red-700"
                onClick={async () => {
                  await fetch(`/api/admin/linkedin/${post.id}`, { method: 'DELETE' });
                  router.refresh();
                }}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TestimonialManager({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Testimonials</h1>
      {message && <p className="text-sm bg-slate-900 text-white rounded-xl px-3 py-2">{message}</p>}
      <form
        className="bg-white border border-slate-200 rounded-2xl p-4 grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const response = await fetch('/api/admin/testimonials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_name: form.get('student_name'),
              firm: form.get('firm'),
              domain: form.get('domain'),
              testimonial: form.get('testimonial'),
              status: form.get('status'),
            }),
          });
          const data = (await response.json()) as { error?: string };
          setMessage(data.error || 'Testimonial saved.');
          if (response.ok) {
            event.currentTarget.reset();
            router.refresh();
          }
        }}
      >
        <input name="student_name" required placeholder="Student name" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <div className="grid sm:grid-cols-2 gap-3">
          <input name="firm" placeholder="Firm" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
          <input name="domain" placeholder="Domain" className="border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        </div>
        <textarea name="testimonial" required placeholder="Testimonial" className="border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-24" />
        <select name="status" className="border border-slate-300 rounded-xl px-3 py-2 text-sm">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button className="bg-blue-600 text-white font-bold rounded-xl py-3">Add testimonial</button>
      </form>
      <div className="space-y-3">
        {testimonials.map((item) => (
          <article key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-bold">{item.student_name} · {item.firm}</div>
                <p className="text-sm text-slate-600 mt-1">{item.testimonial}</p>
                <p className="text-xs text-slate-400 mt-1">{item.status}</p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-red-700"
                onClick={async () => {
                  await fetch(`/api/admin/testimonials/${item.id}`, { method: 'DELETE' });
                  router.refresh();
                }}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
