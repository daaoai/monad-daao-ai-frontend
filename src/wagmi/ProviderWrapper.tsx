import { headers } from 'next/headers';
import ProviderClient from './ProviderClient';
import React from 'react';

export default async function ProviderWrapper({ children }: { children: React.ReactNode }) {
  const wagmiCookie = (await headers()).get('cookie');
  return <ProviderClient wagmiCookie={wagmiCookie}>{children}</ProviderClient>;
}
