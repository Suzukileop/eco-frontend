'use client';

import type { Control, FieldArrayWithId, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import {
  createEmptyProfileService,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileSectionEmptyClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';

const MAX_SERVICES = 8;

type ProfileServicesFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'serviceOffers', 'id'>[];
  append: (value: ReturnType<typeof createEmptyProfileService>) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileFormValues['serviceOffers'];
};

function formatPrice(cents: number | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  return `${(cents / 100).toFixed(2)} €`;
}

export function ProfileServicesField({
  fields,
  append,
  remove,
  move,
  register,
  readOnly = false,
  values = [],
}: ProfileServicesFieldProps) {
  if (readOnly) {
    const filled = values.filter((item) => item.title.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>Aucun service ajouté.</p>;
    }
    return (
      <div className="space-y-3">
        {filled.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/50"
          >
            <p className="font-semibold text-neutral-900 dark:text-white">{service.title}</p>
            {service.description?.trim() ? (
              <p className="mt-2 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                {service.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              {service.basePriceCents != null ? (
                <span>À partir de {formatPrice(service.basePriceCents)}</span>
              ) : null}
              {service.deadline?.trim() ? <span>Délai : {service.deadline}</span> : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className={profileSectionMutedTextClass}>
        Décrivez jusqu&apos;à {MAX_SERVICES} services. Prix indicatif en centimes (ex. 5000 = 50,00 €).
      </p>

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>Aucun service ajouté.</p>
      ) : (
        fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Service {index + 1}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs disabled:opacity-40 dark:border-neutral-700"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-700 dark:border-red-500/30 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={`service-title-${field.id}`} className={profileFormLabelClass}>
                Title
              </label>
              <input
                id={`service-title-${field.id}`}
                type="text"
                className={profileFormInputClass}
                {...register(`serviceOffers.${index}.title`)}
              />
            </div>

            <div>
              <label htmlFor={`service-desc-${field.id}`} className={profileFormLabelClass}>
                Description
              </label>
              <textarea
                id={`service-desc-${field.id}`}
                rows={3}
                className={profileFormInputClass}
                {...register(`serviceOffers.${index}.description`)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`service-price-${field.id}`} className={profileFormLabelClass}>
                  Base price (cents)
                </label>
                <input
                  id={`service-price-${field.id}`}
                  type="number"
                  min={0}
                  className={profileFormInputClass}
                  {...register(`serviceOffers.${index}.basePriceCents`, {
                    setValueAs: (value) => {
                      if (value === '' || value == null) return null;
                      const parsed = Number(value);
                      return Number.isNaN(parsed) ? null : parsed;
                    },
                  })}
                />
              </div>
              <div>
                <label htmlFor={`service-deadline-${field.id}`} className={profileFormLabelClass}>
                  Typical deadline
                </label>
                <input
                  id={`service-deadline-${field.id}`}
                  type="text"
                  placeholder="e.g. 3–5 days"
                  className={profileFormInputClass}
                  {...register(`serviceOffers.${index}.deadline`)}
                />
              </div>
            </div>
          </div>
        ))
      )}

      {fields.length < MAX_SERVICES ? (
        <button
          type="button"
          onClick={() => append(createEmptyProfileService(fields.length))}
          className="rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Add service
        </button>
      ) : null}
    </div>
  );
}
