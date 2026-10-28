import { AuthGuard } from '@/components/AuthGuard';
import { DashboardNav } from '@/components/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <DashboardNav />
        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
