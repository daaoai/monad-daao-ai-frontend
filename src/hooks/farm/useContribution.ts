import { DAO_ADDRESS } from '@/constants/contribution';
import { useAccount, useWriteContract } from 'wagmi';
import { CARTEL } from '@/daao-sdk/abi/cartel';
import { CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { usePublicClient } from 'wagmi';
import { modeTokenAddress } from '@/constants/addresses';
import { useState } from 'react';
import { Abi, formatUnits, Hex, parseUnits } from 'viem';
import { handleViemTransactionError } from '@/utils/approval';
import { toast as reactToast } from 'react-toastify';

const useContribution = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const [approvalTxHash, setApprovalTxHash] = useState<Hex | undefined>(undefined);

  const checkAllowance = async (requiredAmount: number | bigint): Promise<boolean> => {
    if (!address) return false;
    try {
      const allowance: unknown = await publicClient?.readContract({
        address: modeTokenAddress,
        abi: CARTEL,
        functionName: 'allowance',
        args: [address, DAO_ADDRESS],
      });
      return BigInt(allowance as bigint) >= BigInt(requiredAmount);
    } catch (err) {
      console.error('checkAllowance error:', err);
      return false;
    }
  };

  const requestAllowance = async (amountToApprove: number | bigint): Promise<Hex | undefined> => {
    if (!address) return undefined;
    try {
      const tx = await writeContractAsync({
        address: modeTokenAddress,
        abi: CARTEL,
        functionName: 'approve',
        args: [DAO_ADDRESS, amountToApprove],
      });
      if (!tx) throw new Error('Approval transaction failed to send');
      setApprovalTxHash(tx);
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
      reactToast.error(errorMsg);
      return undefined;
    }
  };

  const getDaoInfo = async () => {
    try {
      const finalizeFundraisingGoal = (await publicClient?.readContract({
        address: DAO_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'fundraisingGoal',
      })) as bigint;

      const totalRaised = (await publicClient?.readContract({
        address: DAO_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'totalRaised',
      })) as bigint;
      let whitelistInfo: [boolean, bigint, bigint] | undefined;
      let contributions: bigint | undefined;
      if (address) {
        contributions = (await publicClient?.readContract({
          address: DAO_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'contributions',
          args: [address],
        })) as bigint;
        whitelistInfo = (await publicClient?.readContract({
          address: DAO_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getWhitelistInfo',
          args: [address],
        })) as [boolean, bigint, bigint];
      }

      return {
        finalizeFundraisingGoal: Number(formatUnits(finalizeFundraisingGoal, 18)),
        totalRaised: Number(formatUnits(totalRaised, 18)),
        whitelistInfo: {
          isWhitelisted: whitelistInfo?.[0] ?? false,
          tier: Number(whitelistInfo?.[1] ?? BigInt(0)),
          limit: Number(whitelistInfo?.[2] ?? BigInt(0)),
        },
        contributions: Number(formatUnits(contributions ?? BigInt(0), 18)),
      };
    } catch (err) {
      console.log({ err });
      return null;
    }
  };

  const contribute = async (amount: number) => {
    try {
      const amountInWei = parseUnits(amount.toString(), 18);
      let allowanceSufficient = await checkAllowance(amountInWei);
      if (!allowanceSufficient) {
        const approvalTx = await requestAllowance(amountInWei);
        allowanceSufficient = true;
      }
      console.log({ allowanceSufficient });
      console.log({ amountInWei });
      const txHash = await writeContractAsync({
        address: DAO_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'contribute',
        args: [amountInWei],
        value: amountInWei,
      });
      const txnReceipt = await publicClient?.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });
      if (txnReceipt?.status !== 'success') {
        reactToast.error('Contribution failed');
      }
      reactToast.success('Your Contribution was Successfull');

      return txHash;
    } catch (err) {
      console.log({ err });
      reactToast.error('Contribution failed');
      return undefined;
    }
  };

  const getTierLimits = async (tier: number) => {
    try {
      const tierLimits = await publicClient?.readContract({
        address: DAO_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'tierLimits',
        args: [tier],
      });
      return tierLimits;
    } catch (err) {
      console.log({ err });
      return BigInt(0);
    }
  };

  return { getDaoInfo, contribute, getTierLimits };
};

export default useContribution;
