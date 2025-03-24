import { TICKETS } from '@/daao-sdk/abi/tickets';
import { TICKETS_CONTRACT_ADDRESS, MODE_CHAIN_ID } from '@/constants/ticket';
import { useAccount, useReadContracts } from 'wagmi';
import { Hex } from 'viem';

export interface UserTicketsData {
  count: bigint;
  ticketIds: bigint[];
}

const useGetUserTickets = () => {
  const { address } = useAccount();

  const { data, error, isLoading, isError, refetch } = useReadContracts({
    contracts: [
      {
        address: TICKETS_CONTRACT_ADDRESS as Hex,
        abi: TICKETS,
        chainId: MODE_CHAIN_ID,
        functionName: 'getUserTickets',
        args: address ? [address] : undefined,
      },
    ],
  });

  const userTickets = data && data[0].status === 'success' ? (data[0].result as [bigint, bigint[]]) : undefined;

  const count = userTickets ? userTickets[0] : undefined;
  const ticketIds = userTickets ? userTickets[1] : undefined;
  const finalError = data && data[0].status === 'failure' ? data[0].error : error;

  return {
    count,
    ticketIds,
    error: finalError,
    isLoading,
    isError,
    refetch,
  };
};

export default useGetUserTickets;
