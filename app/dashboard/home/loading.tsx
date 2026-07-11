import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { HomeNewsPageSkeleton } from '@/components/home/HomeNewsSkeleton';

export default function DashboardHomeLoading() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 sm:px-6">
        <HomeNewsPageSkeleton />
      </div>
    </DashboardHomeShell>
  );
}
