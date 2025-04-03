import { DAO_CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { UserContributionInfo } from '@/types/contribution';
import { DaoInfo } from '@/types/dao';
import { multicallForSameContract } from '@/utils/multicall';
import { getPublicClient } from '@/utils/publicClient';
import { Hex, getContract } from 'viem';

export const fetchDaoInfo = async ({
  chainId,
  daoAddress,
}: {
  chainId: number;
  daoAddress: Hex;
}): Promise<DaoInfo | null> => {
  try {
    const daoFunctions = [
      'fundraisingGoal',
      'totalRaised',
      'goalReached',
      'fundraisingFinalized',
      'fundraisingDeadline',
      'daoToken',
      'PAYMENT_TOKEN',
      'tierLimits',
      'isPaymentTokenNative',
    ];

    const [
      fundraisingGoal,
      totalRaised,
      goalReached,
      fundraisingFinalized,
      fundraisingDeadline,
      daoToken,
      paymentToken,
    ] = (await multicallForSameContract({
      abi: DAO_CONTRACT_ABI,
      address: daoAddress,
      chainId,
      functionNames: daoFunctions,
      params: daoFunctions.map(() => []),
    })) as [bigint, bigint, boolean, boolean, bigint, Hex, Hex, boolean];

    const publicClient = getPublicClient(chainId);
    const contract = getContract({
      client: publicClient,
      address: daoAddress,
      abi: DAO_CONTRACT_ABI,
    });
    const isPaymentTokenNative = await contract.read.isPaymentTokenNative();

    return {
      fundraisingGoal,
      totalRaised,
      goalReached,
      fundraisingFinalized,
      daoToken,
      paymentToken,
      fundraisingDeadline: Number(fundraisingDeadline) * 1000,
      isPaymentTokenNative,
    };
  } catch (err) {
    console.log({ err });
    return null;
  }
};

export const fetchUserContributionInfo = async ({
  account,
  daoAddress,
  chainId,
  tokenDecimals,
}: {
  account: Hex | undefined;
  daoAddress: Hex;
  chainId: number;
  tokenDecimals: number;
}): Promise<UserContributionInfo> => {
  let whitelistInfo: readonly [boolean, number, bigint] | undefined;
  let contributions: bigint | undefined;
  if (account) {
    [contributions, whitelistInfo] = (await multicallForSameContract({
      abi: DAO_CONTRACT_ABI,
      address: daoAddress,
      chainId,
      functionNames: ['contributions', 'getWhitelistInfo'],
      params: [[account], [account]],
    })) as [bigint, [boolean, number, bigint]];
  }

  return {
    whitelistInfo: {
      isWhitelisted: whitelistInfo?.[0] ?? false,
      tier: whitelistInfo?.[1] ?? 0,
      limit: whitelistInfo?.[2] ?? BigInt(0),
    },
    contributions: contributions ?? BigInt(0),
  };
};

export const fetchTierLimits = async ({
  tier,
  chainId,
  daoAddress,
}: {
  tier: number;
  chainId: number;
  daoAddress: Hex;
}) => {
  try {
    const publicClient = getPublicClient(chainId);
    const tierLimits = await publicClient.readContract({
      address: daoAddress,
      abi: DAO_CONTRACT_ABI,
      functionName: 'tierLimits',
      args: [tier],
    });
    return tierLimits;
  } catch (err) {
    console.log({ err });
    return BigInt(0);
  }
};
