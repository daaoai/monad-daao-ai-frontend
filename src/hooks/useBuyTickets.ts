import { useState } from 'react';
import { Abi, Hex, parseUnits, zeroAddress } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { TICKETS } from '@/daao-sdk/abi/tickets';
import { CARTEL } from '@/daao-sdk/abi/cartel';
import { DAO_TOKEN_ADDRESS, TICKETS_CONTRACT_ADDRESS } from '@/constants/ticket';
import { decodeEventLog } from 'viem';
import { useToast } from './use-toast';
import { handleViemTransactionError } from '@/utils/approval';
import bn from 'bignumber.js';

export interface MintedData {
  from: Hex;
  to: Hex;
  tokenId: bigint;
}

const parseMintedEvent = (log: { data: string; topics: string[] }): MintedData | null => {
  try {
    const decoded = decodeEventLog({
      abi: TICKETS,
      data: log.data as Hex,
      topics: log.topics as [],
    });
    if (
      decoded.eventName === 'Transfer' &&
      decoded.args &&
      typeof decoded.args === 'object' &&
      'from' in decoded.args &&
      'to' in decoded.args &&
      'tokenId' in decoded.args
    ) {
      const { from, to, tokenId } = decoded.args as {
        from: string;
        to: string;
        tokenId: bigint;
      };

      if (from === zeroAddress) {
        return { from: from as Hex, to: to as Hex, tokenId };
      }
    }
  } catch (err) {
    console.error('Error parsing minted event:', err);
  }
  return null;
};

const useBuyTickets = () => {
  const [txHash, setTxHash] = useState<Hex | undefined>(undefined);
  const [approvalTxHash, setApprovalTxHash] = useState<Hex | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedData, setMintedData] = useState<MintedData | null>(null);
  const { toast } = useToast();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const spender = TICKETS_CONTRACT_ADDRESS;

  const checkAllowance = async (requiredAmount: number | bigint): Promise<boolean> => {
    if (!address) return false;
    try {
      const allowance: unknown = await publicClient?.readContract({
        address: DAO_TOKEN_ADDRESS,
        abi: CARTEL,
        functionName: 'allowance',
        args: [address, spender],
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
        address: DAO_TOKEN_ADDRESS,
        abi: CARTEL,
        functionName: 'approve',
        args: [spender, amountToApprove],
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
      toast({
        title: errorMsg,
        variant: 'destructive',
      });
      setError(errorMsg || 'Approval error occurred');
      return undefined;
    }
  };

  const buyTickets = async ({ ticketCount, ticketPrice }: { ticketCount: number; ticketPrice: number }) => {
    try {
      setError(null);
      setIsSuccess(false);
      setTxHash(undefined);
      setApprovalTxHash(undefined);
      setMintedData(null);
      setIsLoading(true);

      const totalCost = new bn(ticketCount).multipliedBy(ticketPrice).toFixed();
      const requiredApprovalAmount = parseUnits(totalCost, 1);

      const allowanceSufficient = await checkAllowance(requiredApprovalAmount);
      if (!allowanceSufficient) {
        const approvalTx = await requestAllowance(requiredApprovalAmount);
        if (!approvalTx) throw new Error('Approval transaction failed');
      }

      const tx = await writeContractAsync({
        address: TICKETS_CONTRACT_ADDRESS,
        abi: TICKETS,
        functionName: 'buyTickets',
        args: [ticketCount],
      });
      if (!tx) throw new Error('Ticket purchase transaction failed to send');
      setTxHash(tx);

      const receipt = await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      });
      if (receipt?.status !== 'success') {
        throw new Error('Ticket purchase transaction did not succeed');
      }

      let minted: MintedData | null = null;
      for (const log of receipt.logs) {
        minted = parseMintedEvent(log);
        if (minted) break;
      }

      if (minted) {
        setMintedData(minted);
      } else {
        console.warn('No mint event found in the logs');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('buyTickets error:', err);
      toast({
        title: 'Txn Failed',
        variant: 'destructive',
      });
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buyTickets,
    txHash,
    approvalTxHash,
    isLoading,
    isSuccess,
    error,
    mintedData,
  };
};

export default useBuyTickets;
