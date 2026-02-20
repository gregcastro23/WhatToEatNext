'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {useRouter} from 'next/navigation';

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <PrivyProvider
      appId="cmluie0y802fa0cl88n1a4chh"
      onSuccess={() => router.push('/dashboard')}
      config={{
        // Customize Privy's appearance in your app
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png',
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
