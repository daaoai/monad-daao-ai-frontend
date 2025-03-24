import '../globals.css';
import ProviderWrapper from '@/wagmi/ProviderWrapper';
import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import { Toaster } from 'sonner';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';
export const metadata = {
  title: 'Daao App',
  description: 'Daao App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body>
        <ToastContainer />
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
