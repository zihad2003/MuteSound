import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="relative mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl items-center gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="animate-fade-up space-y-7">
          <p className="badge badge-muted">Prayer-time scheduling · privacy-first</p>
          <h1 className="font-display max-w-xl text-5xl leading-[1.05] text-teal-deep sm:text-6xl">
            MuteSound
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-ink-muted">
            Automatically mute browser tabs and phone audio when Azan begins — then restore after a
            short window. Set it once; stay present without fighting the volume.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup" className="btn btn-primary">
              Get started free
            </Link>
            <Link href="/login" className="btn btn-ghost">
              I already have an account
            </Link>
          </div>
          <p className="text-sm text-ink-muted">
            Works with Chrome extension and Android. Undo on every mute.
          </p>
        </section>

        <section
          aria-hidden
          className="animate-fade-up-delay relative overflow-hidden rounded-[28px] border border-line/70 bg-gradient-to-br from-teal-deep via-teal to-[#147a72] p-8 text-white shadow-[0_30px_80px_rgba(8,79,80,0.28)] min-h-[360px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,232,204,0.22),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_40%)]" />
          <div className="relative space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-white/70">Next Azan</p>
              <p className="mt-2 font-display text-5xl tracking-tight">02:14:36</p>
              <p className="mt-1 text-white/75">Maghrib · Dhaka</p>
            </div>
            <ul className="space-y-3 text-sm">
              {['Fajr 04:42', 'Dhuhr 12:05', 'Asr 16:20', 'Maghrib 18:03', 'Isha 19:22'].map(
                (row, i) => (
                  <li
                    key={row}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                      i === 3 ? 'bg-white/15 animate-pulse-soft' : 'bg-white/8'
                    }`}
                  >
                    <span>{row.split(' ')[0]}</span>
                    <span className="tabular-nums">{row.split(' ')[1]}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-line/70 px-5 py-6 text-sm text-ink-muted sm:px-8">
        <span>© {new Date().getFullYear()} MuteSound</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-teal-deep">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-teal-deep">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
