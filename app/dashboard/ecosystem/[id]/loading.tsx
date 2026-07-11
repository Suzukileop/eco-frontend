import { EcosystemDetailSkeleton } from '@/components/ecosystem/EcosystemSkeleton';

export default function EcosystemDetailLoading() {
  return (
    <div className="mx-auto min-w-0 max-w-7xl overflow-x-hidden">
      <EcosystemDetailSkeleton />
    </div>
  );
}
