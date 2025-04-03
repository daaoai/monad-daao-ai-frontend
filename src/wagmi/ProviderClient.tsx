'use client';
import { store } from '@/store';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { cookieToInitialState, WagmiProvider } from 'wagmi';
import { getWagmiConfig } from '.';
// import { SessionProvider } from 'next-auth/react';
import { FundProvider } from '@/components/dashboard/FundContext';
import { ThemeProvider } from '@/components/theme-provider';
import { supportedChainIds } from '@/constants/chains';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProviderClientProps {
  wagmiCookie: string | null;
  children: ReactNode;
}

const ProviderClient = ({ wagmiCookie, children }: ProviderClientProps) => {
  const wagmiConfig = useMemo(() => getWagmiConfig(), []);
  const initialWagmiState = useMemo(() => cookieToInitialState(wagmiConfig, wagmiCookie), [wagmiConfig, wagmiCookie]);
  const queryClient = useMemo(() => new QueryClient(), []); // Fix: Move to useMemo

  return (
    <ReduxProvider store={store}>
      <WagmiProvider config={wagmiConfig} initialState={initialWagmiState}>
        {/* <SessionProvider session={pageProps.session}> */}
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider initialChain={supportedChainIds.monad}>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false} // Changed to false to prevent initial flicker
              forcedTheme="dark" // Force dark theme
              disableTransitionOnChange
            >
              {/* <Layout font={'fontChoice'}> */}
              <FundProvider>
                {children}
                <ToastContainer
                  position="bottom-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark" // or "light"
                />
              </FundProvider>
              {/* </Layout> */}
            </ThemeProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
        {/* </SessionProvider> */}
      </WagmiProvider>
    </ReduxProvider>
  );
};

export default ProviderClient;
