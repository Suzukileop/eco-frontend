import { cookies } from 'next/headers';
import { MarketplaceShell } from '@/components/marketplace/MarketplaceShell';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const authenticated = Boolean(cookies().get('refresh_token'));

  return <MarketplaceShell authenticated={authenticated}>{children}</MarketplaceShell>;
}
