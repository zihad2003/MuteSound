'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { setTokens } from '@/lib/auth';

type Mode = 'login' | 'signup';

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await api.signup(email.trim(), password);
        setTokens({ token: res.token, refresh_token: res.refresh_token });
      } else {
        const res = await api.login(email.trim(), password);
        setTokens(res);
      }
      router.replace('/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface mx-auto w-full max-w-md space-y-5 p-6 sm:p-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-teal-deep">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="text-sm text-ink-muted">
          {mode === 'login'
            ? 'Log in to sync prayer schedules across your devices.'
            : 'Set location once — MuteSound handles the rest.'}
        </p>
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-xl bg-[color-mix(in_srgb,var(--danger)_12%,white)] px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
      </button>

      <p className="text-center text-sm text-ink-muted">
        {mode === 'login' ? (
          <>
            No account yet?{' '}
            <Link href="/signup" className="font-semibold text-teal">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-teal">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
