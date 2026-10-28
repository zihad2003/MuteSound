'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MutePreference, PrayerName } from '@/lib/types';
import { ALL_PRAYERS, PRAYER_LABELS } from '@/lib/types';

export default function MuteSettingsPage() {
  const [enabled, setEnabled] = useState<PrayerName[]>([...ALL_PRAYERS]);
  const [duration, setDuration] = useState(5);
  const [ml, setMl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const pref = await api.getMutePreference();
        if (cancelled) return;
        apply(pref);
      } catch {
        // defaults already set
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function apply(pref: MutePreference) {
    setEnabled(pref.enabled_prayers);
    setDuration(pref.mute_duration_minutes);
    setMl(pref.ml_verification_enabled);
  }

  function togglePrayer(name: PrayerName) {
    setEnabled((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.saveMutePreference({
        enabled_prayers: enabled,
        mute_duration_minutes: duration,
        ml_verification_enabled: ml,
      });
      setMessage('Mute preferences saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink-muted">Loading mute preferences…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="font-display text-3xl text-teal-deep">Mute preferences</h1>
        <p className="text-ink-muted">Choose which prayers trigger auto-mute and for how long.</p>
      </div>

      <form onSubmit={onSubmit} className="surface space-y-5 p-6">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink-muted">Enabled prayers</legend>
          {ALL_PRAYERS.map((name) => (
            <label key={name} className="flex items-center gap-3 rounded-xl border border-line/80 px-3 py-2.5">
              <input
                type="checkbox"
                checked={enabled.includes(name)}
                onChange={() => togglePrayer(name)}
              />
              <span className="font-semibold">{PRAYER_LABELS[name]}</span>
            </label>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="duration">Mute duration (minutes)</label>
          <input
            id="duration"
            type="number"
            min={1}
            max={15}
            required
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-line/80 px-3 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={ml}
            onChange={(e) => setMl(e.target.checked)}
          />
          <span>
            <span className="block font-semibold">Smart audio verification (ML)</span>
            <span className="text-sm text-ink-muted">
              Optional Phase 2 feature. Runs on-device only inside a prayer window — raw audio never
              leaves the device.
            </span>
          </span>
        </label>

        <button type="submit" className="btn btn-primary" disabled={saving || enabled.length === 0}>
          {saving ? 'Saving…' : 'Save preferences'}
        </button>

        {message && <p className="text-sm font-medium text-success">{message}</p>}
        {error && <p className="text-sm font-medium text-danger">{error}</p>}
      </form>
    </div>
  );
}
