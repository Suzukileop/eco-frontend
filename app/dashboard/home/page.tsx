import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { HomeNewsFeed } from '@/components/home/HomeNewsFeed';

export default function DashboardHomePage() {
  return (
    <DashboardHomeShell fullWidth>
      <div className="mx-auto w-full max-w-[1280px] space-y-6 px-4 sm:px-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Actualités</h1>
          <p className="text-sm text-neutral-500">
            Toutes les créations publiées par les créateurs de contenu.
          </p>
        </div>
        <HomeNewsFeed />
      </div>
    </DashboardHomeShell>
  );
}
