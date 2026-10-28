import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <main className="px-5 py-10 sm:px-8">
        <AuthForm mode="login" />
      </main>
    </div>
  );
}
