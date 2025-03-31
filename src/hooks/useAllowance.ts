import { CARTEL } from '@/daao-sdk/abi/cartel';
import { DAO_TOKEN_ADDRESS } from '@/constants/ticket';
import { handleViemTransactionError } from '@/utils/approval';
import { Abi, Hex } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { useToast } from './use-toast';

const useAllowance = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  const checkAllowance = async (requiredAmount: number | bigint, spender: `0x${string}`): Promise<boolean> => {
    if (!address) return false;
    try {
      const allowance: unknown = await publicClient?.readContract({
        address: DAO_TOKEN_ADDRESS,
        abi: CARTEL,
        functionName: 'allowance',
        args: [address, spender],
      });
      console.log({
        allowance,
        requiredAmount,
        address,
        spender,
        CARTEL_TOKEN_ADDRESS: DAO_TOKEN_ADDRESS,
      });
      return BigInt(allowance as bigint) >= BigInt(requiredAmount);
    } catch (err) {
      console.error('checkAllowance error:', err);
      return false;
    }
  };

  const requestAllowance = async (amountToApprove: number | bigint, spender: Hex): Promise<Hex | undefined> => {
    if (!address) return undefined;
    try {
      const tx = await writeContractAsync({
        address: DAO_TOKEN_ADDRESS,
        abi: CARTEL,
        functionName: 'approve',
        args: [spender, amountToApprove],
      });
      if (!tx) throw new Error('Approval transaction failed to send');
      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      });
      if (receipt?.status !== 'success') {
        throw new Error('Approval transaction did not succeed');
      }
      return tx;
    } catch (err: any) {
      console.error('Approval error:', err);
      const { errorMsg } = handleViemTransactionError({
        abi: CARTEL as Abi,
        error: err,
      });
      toast({
        title: errorMsg,
        variant: 'destructive',
      });
      return undefined;
    }
  };

  return { checkAllowance, requestAllowance };
};

export default useAllowance;
