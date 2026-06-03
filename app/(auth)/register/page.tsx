'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AxiosError } from 'axios';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmPassword: z.string(),
    role: z.enum(['CLIENT', 'CREATOR']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENT' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      router.push('/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 429) {
        setApiError('Trop de tentatives d’inscription. Réessaie dans une minute.');
      } else {
        setApiError(
          axiosError.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white text-xl font-bold mb-4 shadow-lg">
            NP
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Créer votre compte</h1>
          <p className="text-gray-500 mt-1">Rejoignez la plateforme NoProbleme</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {apiError && (
            <div className="mb-6">
              <ErrorAlert message={apiError} onDismiss={() => setApiError(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom complet
              </label>
              <input
                id="fullName"
                {...register('fullName')}
                type="text"
                autoComplete="name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                placeholder="Jean Dupont"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                id="email"
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                placeholder="jean@exemple.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500" role="alert">{errors.confirmPassword.message}</p>
              )}
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Type de compte
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(['CLIENT', 'CREATOR'] as const).map((type) => (
                  <label
                    key={type}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition ${
                      selectedRole === type
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      {...register('role')}
                      type="radio"
                      value={type}
                      className="sr-only"
                    />
                    <span className="text-2xl" aria-hidden="true">
                      {type === 'CLIENT' ? '🛍️' : '✏️'}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        selectedRole === type ? 'text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      {type === 'CLIENT' ? 'Client' : 'Créateur'}
                    </span>
                    <span className="text-xs text-gray-400 text-center">
                      {type === 'CLIENT' ? 'Commander du contenu' : 'Créer du contenu'}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Création du compte...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
