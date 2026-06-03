'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data);
      const redirectTo = searchParams.get('redirect');
      const dest =
        redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : '/dashboard';
      router.push(dest);
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const status = axiosError.response?.status;
      if (status === 401) {
        setApiError('Email ou mot de passe incorrect.');
      } else if (status === 403) {
        setApiError('Votre compte a été désactivé. Contactez le support.');
      } else if (status === 429) {
        setApiError('Trop de tentatives de connexion. Réessaie dans une minute.');
      } else {
        setApiError(
          axiosError.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white shadow-lg">
            NP
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
          <p className="mt-1 text-gray-500">Connectez-vous à votre compte</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
          {apiError && (
            <div className="mb-6">
              <ErrorAlert message={apiError} onDismiss={() => setApiError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="jean@exemple.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
