import { EcosystemHubSkeleton } from '@/components/ecosystem/EcosystemSkeleton';

export default function EcosystemHubLoading() {
  return (
    <div className="mx-auto min-w-0 max-w-7xl overflow-x-hidden">
      <EcosystemHubSkeleton />
    </div>
  );
}
