import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hasSession = Boolean(cookies().get('refresh_token'));
  if (!hasSession) redirect('/login');

  return <DashboardShell>{children}</DashboardShell>;
}
