import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { HeaderAuth } from '@/components/layout/HeaderAuth';
import { HeaderPublic } from '@/components/layout/HeaderPublic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NoProbleme — Plateforme SaaS',
  description: 'Création de contenu assistée par IA',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasSession = Boolean(cookies().get('refresh_token'));

  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <AuthProvider>
          {hasSession ? <HeaderAuth /> : <HeaderPublic />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
