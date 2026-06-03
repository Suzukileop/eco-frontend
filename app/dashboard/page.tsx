import { DashboardHomeShell, DashboardWelcomeSection } from '@/components/DashboardHomeShell';
import { ServiceTiles } from '@/components/ServiceTiles';

export default function DashboardPage() {
  return (
    <DashboardHomeShell>
      <DashboardWelcomeSection />
      <ServiceTiles />
    </DashboardHomeShell>
  );
}
