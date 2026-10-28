'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import type { Device } from '@/lib/types';
import { useRouter } from 'next/navigation';

function platformLabel(platform: string) {
  if (platform === 'android') return 'Android app';
  if (platform === 'chrome_extension') return 'Chrome extension';
  if (platform === 'ios') return 'iOS app';
  return platform;
}

export default function DevicesPage() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listDevices();
      setDevices(res.devices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function removeDevice(id: string) {
    setBusyId(id);
    try {
      await api.deleteDevice(id);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove device');
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your MuteSound account and all synced data? This cannot be undone.')) {
      return;
    }
    setDeletingAccount(true);
    try {
      await api.deleteAccount();
      clearTokens();
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account deletion failed');
      setDeletingAccount(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-teal-deep">Devices</h1>
        <p className="text-ink-muted">Linked Chrome extension and mobile apps for this account.</p>
      </div>

      <section className="surface overflow-hidden">
        {loading ? (
          <p className="p-6 text-ink-muted">Loading devices…</p>
        ) : devices.length === 0 ? (
          <div className="space-y-2 p-6">
            <p className="font-semibold text-ink">No devices linked yet</p>
            <p className="text-sm text-ink-muted">
              Install the Chrome extension or Android app and sign in with this account to register a
              device.
            </p>
          </div>
        ) : (
          <ul>
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line/70 px-6 py-4 last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{platformLabel(device.platform)}</p>
                  <p className="text-sm text-ink-muted">
                    Last synced {new Date(device.last_synced_at).toLocaleString()}
                    {device.has_push_token ? ' · FCM registered' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost px-3 py-1.5 text-sm"
                  disabled={busyId === device.id}
                  onClick={() => void removeDevice(device.id)}
                >
                  {busyId === device.id ? 'Removing…' : 'Remove'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <section className="surface space-y-3 border-danger/20 p-6">
        <h2 className="font-display text-xl text-danger">Danger zone</h2>
        <p className="text-sm text-ink-muted">
          Permanently delete your account, location, mute preferences, devices, and refresh tokens.
        </p>
        <button
          type="button"
          className="btn border border-danger bg-white text-danger hover:bg-[color-mix(in_srgb,var(--danger)_10%,white)]"
          disabled={deletingAccount}
          onClick={() => void deleteAccount()}
        >
          {deletingAccount ? 'Deleting…' : 'Delete account'}
        </button>
      </section>
    </div>
  );
}
