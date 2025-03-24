import { CARTEL } from '@/daao-sdk/abi/cartel';
import { CARTEL_TOKEN_ADDRESS, MODE_CHAIN_ID } from '@/constants/ticket';
import { Hex } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';

const useGetBalance = () => {
  const { address } = useAccount();
  const { data, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        abi: CARTEL,
        address: CARTEL_TOKEN_ADDRESS as Hex,
        chainId: MODE_CHAIN_ID,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
      },
      {
        abi: CARTEL,
        address: CARTEL_TOKEN_ADDRESS as Hex,
        chainId: MODE_CHAIN_ID,
        functionName: 'symbol',
      },
      {
        abi: CARTEL,
        address: CARTEL_TOKEN_ADDRESS as Hex,
        chainId: MODE_CHAIN_ID,
        functionName: 'decimals',
      },
      {
        abi: CARTEL,
        address: CARTEL_TOKEN_ADDRESS as Hex,
        chainId: MODE_CHAIN_ID,
        functionName: 'name',
      },
    ],
  });
  const [balanceResult, symbolResult, decimalsResult, nameResult] = data || [];
  return {
    balance: balanceResult?.result as bigint | undefined,
    symbol: symbolResult?.result as string | undefined,
    decimals: decimalsResult?.result as number | undefined,
    name: nameResult?.result as string | undefined,
    isLoading,
    isError,
    refetch,
  };
};

export default useGetBalance;
