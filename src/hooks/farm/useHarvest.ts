import { usePublicClient, useWriteContract } from 'wagmi';
import { POOL_ABI } from '@/daao-sdk/abi/pool';
import { useToast } from '../use-toast';
import { handleViemTransactionError } from '@/utils/approval';
import { Abi } from 'viem';
import { toast as reactToast } from 'react-toastify'; // Ensure to import react-toastify's toast function

const useHarvest = () => {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const harvest = async ({ poolAddress }: { poolAddress: `0x${string}` }) => {
    try {
      const harvestResponse = await writeContractAsync({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'harvest',
      });
      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: harvestResponse,
        confirmations: 1,
      });
      return receipt;
    } catch (error) {
      console.log({ error });
      const { errorMsg } = handleViemTransactionError({
        abi: POOL_ABI as Abi,
        error,
      });
      toast({
        title: errorMsg,
        variant: 'destructive',
      });
    }
  };

  return { harvest };
};

export default useHarvest;
