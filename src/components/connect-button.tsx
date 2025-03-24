'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';
import { mode, goerli, sepolia, berachain, monadTestnet } from 'wagmi/chains'; // Import networks
import Image from 'next/image'; // Import Image component for displaying chain icons
import { Button } from '@/shadcn/components/ui/button';
import { cn } from '@/shadcn/lib/utils';
import React from 'react';

// Array containing Ethereum chain IDs (mainnet, goerli, sepolia)
const ethChainIds: number[] = [mode.id, goerli.id, sepolia.id, berachain.id, monadTestnet.id];

interface ConnectWalletButtonProps {
  className?: string;
  icons: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ className, icons = true }) => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
        const isEthChain = chain && ethChainIds.includes(chain.id);

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <div className="flex flex-row justify-center items-center gap-4">
                    <Button
                      onClick={openConnectModal}
                      type="button"
                      className={cn(
                        'text-sm p-2 bg-[#27292a] rounded-xl flex items-center gap-2 font-bold leading-normal',
                        className,
                      )}
                    >
                      {icons ? <Wallet className="w-3 h-3" /> : <></>}
                      <span className="text-white font-semibold">Connect Wallet</span>
                    </Button>
                  </div>
                );
              }

              if (!isEthChain || chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    type="button"
                    className={cn(
                      'text-sm p-2 bg-red-500 text-white rounded-xl flex items-center gap-2 font-bold leading-normal',
                      className,
                    )}
                  >
                    <span className="sm:block hidden">Wrong network</span>
                    <span className="sm:hidden block">Wrong</span>
                  </Button>
                );
              }

              return (
                <div className="flex gap-1 items-center">
                  <Button
                    onClick={openChainModal}
                    type="button"
                    className={cn(
                      'text-sm p-2 bg-dark-white text-dark-black rounded-xl flex items-center gap-2 font-bold leading-normal min-w-0',
                      className,
                    )}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <Image alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} width={20} height={20} />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:block">{chain.name}</span>
                    <span className="block sm:hidden">{chain.name?.slice(0, 4)}</span>
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    type="button"
                    className={cn(
                      'text-sm p-2 bg-[#27292a] rounded-xl flex items-center gap-2 font-bold leading-normal truncate max-w-[120px] sm:max-w-none',
                      className,
                    )}
                  >
                    <span className="truncate">
                      {/* Show shorter version on mobile */}
                      <span className="hidden sm:block">
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ''}
                      </span>
                      <span className="block sm:hidden">
                        {account.displayName?.slice(0, 6)}...{account.displayName?.slice(-4)}
                      </span>
                    </span>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
