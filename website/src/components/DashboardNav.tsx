'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearTokens } from '@/lib/auth';

const links = [
  { href: '/dashboard', label: 'Home' },
  { href: '/dashboard/schedule', label: 'Schedule' },
  { href: '/dashboard/settings/location', label: 'Location' },
  { href: '/dashboard/settings/mute', label: 'Mute' },
  { href: '/dashboard/devices', label: 'Devices' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearTokens();
    router.replace('/login');
  }

  return (
    <header className="border-b border-line/80 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="font-display text-xl font-semibold text-teal-deep">
            MuteSound
          </Link>
          <button type="button" onClick={logout} className="btn btn-ghost px-3 py-1.5 text-sm">
            Log out
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1">
          {links.map((link) => {
            const active =
              link.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-teal text-white'
                    : 'text-ink-muted hover:bg-teal-soft hover:text-teal-deep'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
