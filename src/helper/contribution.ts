import { daoAddress } from '@/constants/addresses';
import { DAO_CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { UserContributionInfo } from '@/types/contribution';
import { DaoInfo } from '@/types/dao';
import { multicallForSameContract } from '@/utils/multicall';
import { getPublicClient } from '@/utils/publicClient';
import { Hex, formatUnits, getContract } from 'viem';

export const fetchDaoInfo = async ({
  chainId,
  daoAddress,
  tokenDecimals,
}: {
  chainId: number;
  daoAddress: Hex;
  tokenDecimals: number;
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

    // not coming from multicall
    const publicClient = getPublicClient(chainId);
    const contract = getContract({
      client: publicClient,
      address: daoAddress,
      abi: DAO_CONTRACT_ABI,
    });
    const isPaymentTokenNative = await contract.read.isPaymentTokenNative();

    return {
      fundraisingGoal: Number(formatUnits(fundraisingGoal, tokenDecimals)),
      totalRaised: Number(formatUnits(totalRaised, tokenDecimals)),
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
      limit: Number(formatUnits(whitelistInfo?.[2] ?? BigInt(0), tokenDecimals)),
    },
    contributions: Number(formatUnits(contributions ?? BigInt(0), tokenDecimals)),
  };
};

export const fetchTierLimits = async ({
  tier,
  tokenDecimals,
  chainId,
}: {
  tier: number;
  tokenDecimals: number;
  chainId: number;
}) => {
  try {
    const publicClient = getPublicClient(chainId);
    const tierLimits = await publicClient.readContract({
      address: daoAddress,
      abi: DAO_CONTRACT_ABI,
      functionName: 'tierLimits',
      args: [tier],
    });
    return Number(formatUnits(tierLimits, tokenDecimals));
  } catch (err) {
    console.log({ err });
    return 0;
  }
};
