import { POOL_ABI } from '@/daao-sdk/abi/pool';
import { usePublicClient, useWriteContract } from 'wagmi';
import useAllowance from '../useAllowance';
import { Abi, Hex } from 'viem';
import { handleViemTransactionError } from '@/utils/approval';
import { useToast } from '../use-toast';
import { toast as reactToast } from 'react-toastify'; // Ensure to import react-toastify's toast function

const useDeposit = () => {
  const publicClient = usePublicClient();
  const { checkAllowance, requestAllowance } = useAllowance();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const deposit = async ({
    tokenAddress,
    poolAddress,
    amount,
  }: {
    tokenAddress: Hex;
    poolAddress: `0x${string}`;
    amount: bigint;
  }) => {
    try {
      let allowanceSufficient = await checkAllowance(amount, poolAddress);
      if (!allowanceSufficient) {
        const approvalTx = await requestAllowance(amount, poolAddress);
        allowanceSufficient = true;
      }
      const tx = await writeContractAsync({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'deposit',
        args: [amount],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      });
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

  return { deposit };
};
export default useDeposit;
