import { viemChainsById } from '@/constants/chains';
import { Chain } from 'viem';

export const getViemChainById = (chainId: number): Chain => {
  return viemChainsById[chainId];
};
