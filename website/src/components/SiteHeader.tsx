import Link from 'next/link';

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="group flex items-baseline gap-2">
        <span className="font-display text-2xl font-semibold tracking-tight text-teal-deep transition group-hover:text-teal">
          MuteSound
        </span>
        {!compact && (
          <span className="hidden text-sm text-ink-muted sm:inline">auto-mute at Azan</span>
        )}
      </Link>
      <nav className="flex items-center gap-2 sm:gap-3">
        <Link href="/login" className="btn btn-ghost px-4 py-2 text-sm">
          Log in
        </Link>
        <Link href="/signup" className="btn btn-primary px-4 py-2 text-sm">
          Sign up
        </Link>
      </nav>
    </header>
  );
}
