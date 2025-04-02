import * as viemChains from 'viem/chains';

export const supportedChainIds = {
  monad: 10143,
  bsc: 56,
};

export const viemChainsById: Record<number, viemChains.Chain> = Object.values(viemChains).reduce((acc, chainData) => {
  return chainData.id
    ? {
        ...acc,
        [chainData.id]: chainData,
      }
    : acc;
}, {});
