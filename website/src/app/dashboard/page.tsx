'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Countdown } from '@/components/Countdown';
import { ApiError, api } from '@/lib/api';
import { getNextPrayer, isWithinMuteWindow } from '@/lib/prayer';
import type { LocationSetting, MutePreference, PrayerTimesDay } from '@/lib/types';
import { ALL_PRAYERS, PRAYER_LABELS } from '@/lib/types';

export default function DashboardHomePage() {
  const [location, setLocation] = useState<LocationSetting | null>(null);
  const [preference, setPreference] = useState<MutePreference | null>(null);
  const [day, setDay] = useState<PrayerTimesDay | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const loc = await api.getLocation();
        if (cancelled) return;
        setLocation(loc);

        let pref: MutePreference | null = null;
        try {
          pref = await api.getMutePreference();
        } catch {
          pref = {
            enabled_prayers: ALL_PRAYERS,
            mute_duration_minutes: 5,
            ml_verification_enabled: false,
          };
        }
        if (cancelled) return;
        setPreference(pref);

        const times = await api.getMyPrayerTimes();
        if (cancelled) return;
        setDay(times);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setError('location_missing');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-ink-muted">Loading today’s schedule…</p>;
  }

  if (error === 'location_missing') {
    return (
      <div className="surface max-w-xl space-y-4 p-6">
        <h1 className="font-display text-3xl text-teal-deep">Set your location</h1>
        <p className="text-ink-muted">
          Choose a city so MuteSound can fetch today’s prayer times and start the countdown.
        </p>
        <Link href="/dashboard/settings/location" className="btn btn-primary">
          Open location settings
        </Link>
      </div>
    );
  }

  if (error || !day || !preference) {
    return (
      <div className="surface max-w-xl space-y-3 p-6">
        <h1 className="font-display text-2xl text-danger">Couldn’t load dashboard</h1>
        <p className="text-ink-muted">{error ?? 'Unknown error'}</p>
        <Link href="/dashboard/settings/location" className="btn btn-ghost">
          Check location settings
        </Link>
      </div>
    );
  }

  const next = getNextPrayer(day, preference);
  const mute = isWithinMuteWindow(day, preference);
  const enabled = new Set(preference.enabled_prayers);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-teal-deep sm:text-4xl">Today</h1>
          <p className="text-ink-muted">
            {location?.city} · {day.date}
          </p>
        </div>
        {mute.active ? (
          <span className="badge badge-active">Mute active · {mute.prayer}</span>
        ) : (
          <span className="badge badge-muted">Standing by</span>
        )}
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface space-y-3 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Next Azan
          </p>
          <Countdown targetMs={next?.msUntil ?? null} />
          <p className="text-ink-muted">
            {next ? (
              <>
                {next.label} at <span className="font-semibold text-ink">{next.time}</span>
              </>
            ) : (
              'No remaining enabled prayers today'
            )}
          </p>
        </div>

        <div className="surface space-y-3 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Quick links
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/settings/mute" className="btn btn-ghost justify-start">
              Mute preferences
            </Link>
            <Link href="/dashboard/devices" className="btn btn-ghost justify-start">
              Manage devices
            </Link>
            <Link href="/dashboard/schedule" className="btn btn-ghost justify-start">
              Weekly schedule
            </Link>
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-line/80 px-6 py-4">
          <h2 className="font-display text-2xl text-teal-deep">Today’s prayers</h2>
        </div>
        <ul>
          {ALL_PRAYERS.map((name) => {
            const on = enabled.has(name);
            return (
              <li
                key={name}
                className="flex items-center justify-between gap-4 border-b border-line/60 px-6 py-3.5 last:border-b-0"
              >
                <div>
                  <p className="font-semibold text-ink">{PRAYER_LABELS[name]}</p>
                  <p className="text-sm text-ink-muted">{on ? 'Auto-mute on' : 'Skipped'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-xl tabular-nums text-teal-deep">
                    {day[name]}
                  </span>
                  <span className={`badge ${on ? 'badge-muted' : 'badge-warn'}`}>
                    {on ? 'On' : 'Off'}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
