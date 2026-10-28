'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ApiError, api } from '@/lib/api';
import type { CalculationMethod, LocationSetting } from '@/lib/types';
import { CALCULATION_METHODS } from '@/lib/types';

const CITY_PRESETS: Record<string, { latitude: number; longitude: number }> = {
  Dhaka: { latitude: 23.8103, longitude: 90.4125 },
  Chittagong: { latitude: 22.3569, longitude: 91.7832 },
  Sylhet: { latitude: 24.8949, longitude: 91.8687 },
  Karachi: { latitude: 24.8607, longitude: 67.0011 },
  Jakarta: { latitude: -6.2088, longitude: 106.8456 },
  Istanbul: { latitude: 41.0082, longitude: 28.9784 },
};

export default function LocationSettingsPage() {
  const [city, setCity] = useState('Dhaka');
  const [latitude, setLatitude] = useState(23.8103);
  const [longitude, setLongitude] = useState(90.4125);
  const [method, setMethod] = useState<CalculationMethod>('DHAKA');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const loc = await api.getLocation();
        if (cancelled) return;
        applyLocation(loc);
      } catch (err) {
        if (cancelled) return;
        if (!(err instanceof ApiError && err.status === 404)) {
          setError(err instanceof Error ? err.message : 'Failed to load location');
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

  function applyLocation(loc: LocationSetting) {
    setCity(loc.city);
    setLatitude(loc.latitude);
    setLongitude(loc.longitude);
    setMethod(loc.calculation_method);
  }

  function onCityPreset(nextCity: string) {
    setCity(nextCity);
    const preset = CITY_PRESETS[nextCity];
    if (preset) {
      setLatitude(preset.latitude);
      setLongitude(preset.longitude);
    }
  }

  function useGps() {
    setError(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(4)));
        setLongitude(Number(pos.coords.longitude.toFixed(4)));
        setMessage('Coordinates filled from GPS — confirm city name, then save.');
      },
      () => setError('Could not read GPS location. Check browser permission.'),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.saveLocation({
        city: city.trim(),
        latitude,
        longitude,
        calculation_method: method,
      });
      setMessage('Location saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-ink-muted">Loading location…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="font-display text-3xl text-teal-deep">Location</h1>
        <p className="text-ink-muted">City and calculation method for prayer-time lookups.</p>
      </div>

      <form onSubmit={onSubmit} className="surface space-y-4 p-6">
        <div className="field">
          <label htmlFor="city">City</label>
          <input
            id="city"
            list="city-presets"
            required
            value={city}
            onChange={(e) => onCityPreset(e.target.value)}
          />
          <datalist id="city-presets">
            {Object.keys(CITY_PRESETS).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="lat">Latitude</label>
            <input
              id="lat"
              type="number"
              step="any"
              required
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="lng">Longitude</label>
            <input
              id="lng"
              type="number"
              step="any"
              required
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="method">Calculation method</label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as CalculationMethod)}
          >
            {CALCULATION_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={useGps}>
            Use my location
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save location'}
          </button>
        </div>

        {message && <p className="text-sm font-medium text-success">{message}</p>}
        {error && <p className="text-sm font-medium text-danger">{error}</p>}
      </form>
    </div>
  );
}
