'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreatorProfileDto, SOCIAL_PLATFORMS } from '@/types/ecosystem';

const platformEnum = z.enum([
  'INSTAGRAM',
  'YOUTUBE',
  'TIKTOK',
  'TWITTER',
  'LINKEDIN',
  'OTHER',
]);

const linkEntrySchema = z.object({
  platform: platformEnum,
  url: z.string().min(1, 'URL requise.').url('URL invalide.'),
});

const profileSchema = z
  .object({
    bio: z.string().max(8000).optional(),
    niche: z.string().max(150).optional(),
    websiteUrl: z.string().optional(),
    links: z.array(linkEntrySchema),
  })
  .superRefine((data, ctx) => {
    const w = data.websiteUrl?.trim();
    if (w && !/^https?:\/\/.+/i.test(w)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'URL du site invalide (http ou https requis).',
        path: ['websiteUrl'],
      });
    }
  });

type ProfileFormValues = z.input<typeof profileSchema>;

export default function CreatorProfilePage() {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !hasRole('ROLE_CREATOR')) {
      router.replace('/dashboard');
    }
  }, [isLoading, user, hasRole, router]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      niche: '',
      websiteUrl: '',
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'links' });

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setLoadError(null);
      const res = await api.get<CreatorProfileDto>('/api/creator/profile');
      const p = res.data;
      const linksFromRecord =
        p.socialLinks && typeof p.socialLinks === 'object'
          ? Object.entries(p.socialLinks)
              .filter(([k]) => platformEnum.safeParse(k).success)
              .map(([platform, url]) => ({
                platform: platformEnum.parse(platform),
                url,
              }))
          : [];
      form.reset({
        bio: p.bio ?? '',
        niche: p.niche ?? '',
        websiteUrl: p.websiteUrl ?? '',
        links: linksFromRecord.length > 0 ? linksFromRecord : [],
      });
    } catch (e) {
      setLoadError(getApiErrorMessage(e, 'Impossible de charger le profil.'));
    } finally {
      setLoadingProfile(false);
    }
  }, [form]);

  useEffect(() => {
    if (!user || !hasRole('ROLE_CREATOR')) return;
    void loadProfile();
  }, [user, hasRole, loadProfile]);

  const onSubmit = async (raw: ProfileFormValues) => {
    setSubmitError(null);
    setSaving(true);
    try {
      const trimmedLinks = raw.links.filter((l) => l.url.trim().length > 0);
      const parsed = profileSchema.parse({ ...raw, links: trimmedLinks });
      const socialLinks: Record<string, string> = {};
      for (const row of parsed.links) {
        socialLinks[row.platform] = row.url;
      }
      const site = parsed.websiteUrl?.trim();
      await api.put('/api/creator/profile', {
        bio: parsed.bio?.trim() ? parsed.bio.trim() : undefined,
        niche: parsed.niche?.trim() ? parsed.niche.trim() : undefined,
        websiteUrl: site ? site : undefined,
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      });
      await loadProfile();
    } catch (e) {
      setSubmitError(getApiErrorMessage(e, 'Enregistrement impossible.'));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasRole('ROLE_CREATOR')) {
    return null;
  }

  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Tableau de bord
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Profil créateur</h1>
          <p className="text-sm text-gray-600">Informations visibles sur votre activité.</p>
        </div>

        {loadError && <ErrorAlert message={loadError} />}

        {loadingProfile ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            noValidate
          >
            {submitError && <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />}

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={5}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                {...form.register('bio')}
              />
              {form.formState.errors.bio && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.bio.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="niche" className="block text-sm font-medium text-gray-700">
                Niche
              </label>
              <input
                id="niche"
                type="text"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                {...form.register('niche')}
              />
              {form.formState.errors.niche && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.niche.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                Site web
              </label>
              <input
                id="websiteUrl"
                type="url"
                placeholder="https://"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                {...form.register('websiteUrl')}
              />
              {form.formState.errors.websiteUrl && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.websiteUrl.message}</p>
              )}
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-gray-900">Réseaux sociaux</legend>
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label htmlFor={`platform-${field.id}`} className="block text-xs font-medium text-gray-600">
                      Plateforme
                    </label>
                    <select
                      id={`platform-${field.id}`}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      {...form.register(`links.${index}.platform`)}
                    >
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-[2]">
                    <label htmlFor={`url-${field.id}`} className="block text-xs font-medium text-gray-600">
                      URL
                    </label>
                    <input
                      id={`url-${field.id}`}
                      type="url"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      {...form.register(`links.${index}.url`)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                  >
                    Retirer
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ platform: 'INSTAGRAM', url: '' })}
                className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Ajouter un réseau
              </button>
              {form.formState.errors.links && (
                <p className="text-sm text-red-600">{String(form.formState.errors.links.message ?? '')}</p>
              )}
            </fieldset>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving && <LoadingSpinner size="sm" />}
                Enregistrer
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardHomeShell>
  );
}
