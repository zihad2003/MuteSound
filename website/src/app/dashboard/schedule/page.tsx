'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError, api } from '@/lib/api';
import type { PrayerTimesWeek } from '@/lib/types';
import { ALL_PRAYERS, PRAYER_LABELS } from '@/lib/types';

export default function SchedulePage() {
  const [week, setWeek] = useState<PrayerTimesWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.getMyPrayerTimesWeek();
        if (cancelled) return;
        setWeek(data);
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          (err.status === 404 || err.code === 'LOCATION_NOT_SET')
        ) {
          setError('location_missing');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load schedule');
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

  if (loading) return <p className="text-ink-muted">Loading weekly schedule…</p>;

  if (error === 'location_missing') {
    return (
      <div className="surface max-w-xl space-y-4 p-6">
        <h1 className="font-display text-3xl text-teal-deep">Set location first</h1>
        <p className="text-ink-muted">Weekly prayer times need a saved city.</p>
        <Link href="/dashboard/settings/location" className="btn btn-primary">
          Open location settings
        </Link>
      </div>
    );
  }

  if (error || !week) {
    return <p className="text-danger">{error ?? 'No schedule'}</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-teal-deep">Weekly schedule</h1>
        <p className="text-ink-muted">
          Next 7 days for {week.city}. Powered by Aladhan API.
        </p>
      </div>

      <div className="surface overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line/80 bg-teal-soft/40 text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Date</th>
              {ALL_PRAYERS.map((p) => (
                <th key={p} className="px-4 py-3 font-semibold">
                  {PRAYER_LABELS[p]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {week.days.map((day) => (
              <tr key={day.date} className="border-b border-line/50 last:border-b-0">
                <td className="px-4 py-3 font-semibold text-teal-deep">{day.date}</td>
                {ALL_PRAYERS.map((p) => (
                  <td key={p} className="px-4 py-3 tabular-nums">
                    {day[p]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
