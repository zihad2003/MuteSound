import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <main className="mx-auto max-w-3xl space-y-6 px-5 py-10 sm:px-8">
        <h1 className="font-display text-4xl text-teal-deep">Privacy Policy</h1>
        <p className="text-ink-muted">Last updated: October 28, 2026</p>
        <div className="surface space-y-4 p-6 leading-relaxed text-ink">
          <p>
            MuteSound stores your account email, location settings (city / coordinates / calculation
            method), mute preferences, and registered device metadata so schedules can sync across
            the website, Chrome extension, and Android app.
          </p>
          <p>
            Prayer times are fetched from the public Aladhan API and cached on our servers. We do
            not sell personal data. Optional on-device audio verification (Phase 2) processes audio
            locally only — raw audio never leaves your device.
          </p>
          <p>
            You may delete your account and associated data at any time from the dashboard devices /
            account controls once signed in.
          </p>
          <p>
            Contact:{' '}
            <a className="font-semibold text-teal" href="mailto:privacy@mutesound.app">
              privacy@mutesound.app
            </a>
          </p>
        </div>
        <Link href="/" className="btn btn-ghost">
          ← Back home
        </Link>
      </main>
    </div>
  );
}
