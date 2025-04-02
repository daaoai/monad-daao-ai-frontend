import { chainsData } from '@/config/chains';
import { DAO_CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { CARTEL } from '@/daao-sdk/abi/cartel';
import { fetchDaoInfo, fetchTierLimits, fetchUserContributionInfo } from '@/helper/contribution';
import { handleViemTransactionError } from '@/utils/approval';
import { getPublicClient } from '@/utils/publicClient';
import { useState } from 'react';
import { toast as reactToast } from 'react-toastify';
import { Abi, Hex } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

const useContribution = ({ chainId }: { chainId: number }) => {
  const { address: account } = useAccount();
  const publicClient = getPublicClient(chainId);
  const token = chainsData[chainId].contribution.token.address;
  const tokenDecimals = chainsData[chainId].contribution.token.decimals;
  const { writeContractAsync } = useWriteContract();
  const [approvalTxHash, setApprovalTxHash] = useState<Hex | undefined>(undefined);

  const daoAddress = chainsData[chainId].daoAddress;

  const checkAllowance = async (requiredAmount: bigint): Promise<boolean> => {
    if (!account) return false;
    try {
      const allowance: unknown = await publicClient.readContract({
        address: token,
        abi: CARTEL,
        functionName: 'allowance',
        args: [account, daoAddress],
      });
      return BigInt(allowance as bigint) >= BigInt(requiredAmount);
    } catch (err) {
      console.error('checkAllowance error:', err);
      return false;
    }
  };

  const requestAllowance = async ({ amount, token }: { amount: bigint; token: Hex }): Promise<Hex | undefined> => {
    if (!account) return undefined;
    try {
      const tx = await writeContractAsync({
        address: token,
        abi: CARTEL,
        functionName: 'approve',
        args: [daoAddress, amount],
      });
      if (!tx) throw new Error('Approval transaction failed to send');
      setApprovalTxHash(tx);
      const receipt = await publicClient.waitForTransactionReceipt({
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
    return fetchDaoInfo({
      daoAddress,
      chainId,
      tokenDecimals,
    });
  };

  const getUserContributionInfo = async () => {
    return fetchUserContributionInfo({
      account,
      daoAddress,
      chainId,
      tokenDecimals,
    });
  };

  const contribute = async (amount: bigint) => {
    try {
      if (!account) {
        reactToast.error('No wallet connected');
        return undefined;
      }

      const txHash = await writeContractAsync({
        address: daoAddress,
        abi: DAO_CONTRACT_ABI,
        functionName: 'contribute',
        args: [amount],
        value: amount,
      });

      const txnReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (txnReceipt?.status !== 'success') {
        reactToast.error('Contribution failed');
        return undefined;
      }

      reactToast.success('Your Contribution was Successful');
      return txHash;
    } catch (err) {
      console.error('Contribution error:', err);
      reactToast.error('Contribution failed');
      return undefined;
    }
  };

  const contributeWithToken = async (amount: bigint) => {
    try {
      if (!account) {
        reactToast.error('No wallet connected');
        return undefined;
      }

      let allowanceSufficient = await checkAllowance(amount);
      if (!allowanceSufficient) {
        await requestAllowance({ amount, token: token });
        allowanceSufficient = await checkAllowance(amount);
        if (!allowanceSufficient) {
          throw new Error('Approval failed');
        }
      }

      const txHash = await writeContractAsync({
        address: daoAddress,
        abi: DAO_CONTRACT_ABI,
        functionName: 'contribute',
        args: [amount],
      });

      const txnReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (txnReceipt?.status !== 'success') {
        reactToast.error('Contribution failed');
        return undefined;
      }

      reactToast.success('Your Contribution was Successful');
      return txHash;
    } catch (err) {
      console.error('Token contribution error:', err);
      reactToast.error('Contribution failed');
      return undefined;
    }
  };

  const getTierLimits = async (tier: number) => {
    return fetchTierLimits({
      tier,
      tokenDecimals,
      chainId,
    });
  };

  return { getDaoInfo, contribute, getTierLimits, contributeWithToken, getUserContributionInfo };
};

export default useContribution;
