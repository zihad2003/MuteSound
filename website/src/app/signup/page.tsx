import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader compact />
      <main className="px-5 py-10 sm:px-8">
        <AuthForm mode="signup" />
      </main>
    </div>
  );
}
