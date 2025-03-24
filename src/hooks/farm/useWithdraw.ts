import { usePublicClient, useWriteContract } from 'wagmi';
import { POOL_ABI } from '@/daao-sdk/abi/pool';
import { useToast } from '../use-toast';
import { handleViemTransactionError } from '@/utils/approval';
import { Abi, Hex } from 'viem';
import { FARM_CONTRACT_ADDRESS } from '@/constants/farm';
import { FARM_ABI } from '@/daao-sdk/abi/farm';
import { toast as reactToast } from 'react-toastify';

const useWithDraw = () => {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const withdraw = async ({ poolAddress, amount }: { poolAddress: `0x${string}`; amount: bigint }) => {
    try {
      reactToast.success('Processing Withdrawal...');

      const withdrawResponse = await writeContractAsync({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'withdraw',
        args: [amount],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: withdrawResponse,
        confirmations: 1,
      });
      reactToast.success('Withdrawal Successful');

      console.log({ withdraw: receipt });
      return receipt;
    } catch (error) {
      console.log({ error });
      const { errorMsg } = handleViemTransactionError({
        abi: POOL_ABI as Abi,
        error,
      });

      toast({
        title: 'Withdrawal Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  const startWithdraw = async () => {
    try {
      reactToast.success('Initiating Withdrawal...');

      const startWithdrawResponse = await writeContractAsync({
        address: FARM_CONTRACT_ADDRESS,
        abi: FARM_ABI,
        functionName: 'startWithdraw',
      });

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: startWithdrawResponse,
        confirmations: 1,
      });

      if (receipt?.status === 'success') {
        const withdrawTime = await getWithdrawalTime({
          address: FARM_CONTRACT_ADDRESS,
        });
        reactToast.success('Withdrawal Initiated');
      }
      console.log({ startWithdraw: receipt });
      return receipt;
    } catch (error) {
      console.log({ error });
      const { errorMsg } = handleViemTransactionError({
        abi: POOL_ABI as Abi,
        error,
      });

      reactToast.error(errorMsg);
    }
  };

  const getWithdrawalTime = async ({ address }: { address: Hex }) => {
    try {
      const withdrawalTime = await publicClient?.readContract({
        address: FARM_CONTRACT_ADDRESS,
        abi: FARM_ABI,
        functionName: 'withdrawalTime',
        args: [address],
      });

      if (Number(withdrawalTime) === 0) return 'Not Initiated';

      const currentTime = BigInt(Math.floor(Date.now() / 1000));
      const remainingTime = BigInt(Math.floor(Number(withdrawalTime))) - currentTime;
      console.log({ withdrawalTime });
      if (remainingTime > 0) {
        const days = Math.floor(Number(remainingTime) / (60 * 60 * 24));
        const hours = Math.floor((Number(remainingTime) % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((Number(remainingTime) % (60 * 60)) / 60);

        return `${days} days, ${hours} hours, ${minutes} minutes`;
      }

      return 'Available Now';
    } catch (error) {
      console.log({ error });
      const { errorMsg } = handleViemTransactionError({
        abi: POOL_ABI as Abi,
        error,
      });

      reactToast.error(errorMsg);

      return 'Unknown Time';
    }
  };

  return { withdraw, startWithdraw, getWithdrawalTime };
};

export default useWithDraw;
