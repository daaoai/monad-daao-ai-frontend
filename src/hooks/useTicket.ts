import { TICKETS } from '@/daao-sdk/abi/tickets';
import { TICKETS_CONTRACT_ADDRESS } from '@/constants/ticket';
import { useReadContracts } from 'wagmi';
const useGetTicketPrice = () => {
  const { data, error, isLoading } = useReadContracts({
    contracts: [
      {
        address: TICKETS_CONTRACT_ADDRESS,
        abi: TICKETS,
        functionName: 'ticketPrice',
      },
    ],
  });
  const ticketPrice = data && data[0].status === 'success' ? data[0].result : undefined;
  const finalError = data && data[0].status === 'failure' ? data[0].error : error;

  return {
    ticketPrice,
    error: finalError,
    isLoading,
  };
};

export default useGetTicketPrice;
