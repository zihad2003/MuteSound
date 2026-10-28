import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-10 sm:px-8">
        <h1 className="font-display text-4xl text-teal-deep">Terms of Service</h1>
        <p className="text-ink-muted">Last updated: October 28, 2026</p>
        <div className="surface space-y-4 p-6 leading-relaxed text-ink">
          <p>
            MuteSound is provided as a convenience utility that schedules mute actions around
            published prayer times. Prayer-time accuracy depends on third-party calculation sources
            and your configured location/method.
          </p>
          <p>
            You are responsible for reviewing mute notifications and using Undo when needed. Do not
            rely on MuteSound for emergency audio, accessibility-critical alerts, or call audio
            without monitoring the notification.
          </p>
          <p>
            Accounts must be used only on devices you control. Automated abuse, scraping, or
            attempts to mute devices without their owner&apos;s consent are prohibited.
          </p>
        </div>
        <Link href="/" className="btn btn-ghost">
          ← Back home
        </Link>
      </main>
    </div>
  );
}
