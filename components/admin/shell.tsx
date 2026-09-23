'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/batches', label: 'Batches' },
  { href: '/admin/students', label: 'Students' },
  { href: '/admin/linkedin', label: 'LinkedIn' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/messages', label: 'Messages' },
];

export function AdminShell({ username, children }: { username: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-extrabold tracking-tight">The Umbrella Network</Link>
            <p className="text-[11px] text-slate-400">Admin · {username}</p>
          </div>
          <button
            type="button"
            className="text-xs font-semibold border border-slate-700 rounded-lg px-3 py-2 hover:bg-slate-800"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              router.replace('/admin/login');
              router.refresh();
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
        <nav className="flex md:flex-col gap-2 overflow-x-auto">
          {LINKS.map((link) => {
            const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold px-3 py-2 rounded-xl whitespace-nowrap ${active ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
