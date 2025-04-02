import { chainsData } from '@/config/chains';
import { createPublicClient, fallback, http, PublicClient } from 'viem';
import { getViemChainById } from './chains';

export const getPublicClient = (chainId: number): PublicClient => {
  const rpcs = chainsData[chainId].rpcUrls;
  return createPublicClient({
    transport: rpcs.length ? fallback(rpcs.map((rpc) => http(rpc, { batch: { wait: 100 }, retryDelay: 400 }))) : http(),
    chain: getViemChainById(chainId),
  });
};
