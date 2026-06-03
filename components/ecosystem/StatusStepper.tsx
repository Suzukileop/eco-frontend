'use client';

import type { NextStep } from '@/types/ecosystem';

const STEPS = [
  'Formulaire',
  'Confirmation bot',
  'En attente agent',
  'Validation modèle',
  'Paiement',
  'Planification',
  'Actif',
] as const;

function stepIndexForNextStep(next: NextStep | string): number {
  switch (next) {
    case 'BOT_CHAT':
      return 1;
    case 'WAITING_AGENT':
      return 2;
    case 'VALIDATE_MODEL':
      return 3;
    case 'PAYMENT':
      return 4;
    case 'SCHEDULER':
      return 5;
    case 'ACTIVE':
      return 6;
    default:
      return 0;
  }
}

type Props = {
  nextStep: NextStep | string;
};

export function StatusStepper({ nextStep }: Props) {
  const current = stepIndexForNextStep(nextStep);

  return (
    <nav aria-label="Étapes du parcours écosystème" className="w-full">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {STEPS.map((label, index) => {
          const done = index < current;
          const active = index === current;
          const pending = index > current;

          return (
            <li key={label} className="flex flex-col items-center text-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  done
                    ? 'bg-green-600 text-white'
                    : active
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-2'
                      : 'bg-gray-200 text-gray-500'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                {done ? '✓' : index + 1}
              </div>
              <span
                className={`mt-2 text-[11px] font-medium leading-tight sm:text-xs ${
                  active ? 'font-bold text-gray-900' : pending ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
