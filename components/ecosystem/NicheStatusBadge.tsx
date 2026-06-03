import type { NicheStatus } from '@/types/ecosystem';

const styles: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-900 ring-amber-200',
  PROPOSED: 'bg-blue-100 text-blue-900 ring-blue-200',
  VALIDATED: 'bg-green-100 text-green-900 ring-green-200',
  PAID: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  ACTIVE: 'bg-green-100 text-green-900 ring-green-200',
  REJECTED: 'bg-red-100 text-red-900 ring-red-200',
  CANCELLED: 'bg-gray-100 text-gray-800 ring-gray-200',
};

const labels: Record<string, string> = {
  PENDING: 'En attente',
  PROPOSED: 'Proposition',
  VALIDATED: 'Validé',
  PAID: 'Payé',
  ACTIVE: 'Actif',
  REJECTED: 'Refusé',
  CANCELLED: 'Annulé',
};

export function NicheStatusBadge({ status }: { status: NicheStatus | string }) {
  const key = String(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[key] ?? 'bg-gray-100 text-gray-800 ring-gray-200'}`}
    >
      {labels[key] ?? key}
    </span>
  );
}
