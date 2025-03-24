'use client';
import { POLLING_INTERVAL } from '@/constants/wagmi';
import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { goerli, sepolia, berachain, monadTestnet } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  frontierWallet,
  metaMaskWallet,
  okxWallet,
  phantomWallet,
  safepalWallet,
  trustWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        trustWallet,
        frontierWallet,
        safepalWallet,
        phantomWallet,
        okxWallet,
      ],
    },
  ],
  { appName: 'Daao.ai', projectId: '762399822f3c6326e60b27c2c2085d52' || '' },
);

export const getWagmiConfig = () => {
  return createConfig({
    chains: [
      // monad,
      //  goerli, sepolia,
      berachain,
      monadTestnet,
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    pollingInterval: POLLING_INTERVAL.ms1500,
    syncConnectedChain: true,
    transports: {
      // [monad.id]: http(),
      // [goerli.id]: http(),
      // [sepolia.id]: http(),
      [monadTestnet.id]: http(),
      [berachain.id]: http(),
    },
    ssr: true,
    connectors,
  });
};
