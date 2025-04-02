import { chainsData } from '@/config/chains';
import { TIER_LABELS } from '@/constants/contribution';
import { fetchDaoInfo, fetchTierLimits, fetchUserContributionInfo } from '@/helper/contribution';
import { UserContributionInfo } from '@/types/contribution';
import { getPublicClient } from '@/utils/publicClient';
import { useEffect, useState } from 'react';
import { erc20Abi, formatUnits } from 'viem';
import { useAccount } from 'wagmi';

export const useFetchBalance = () => {
  const { address: account, chainId } = useAccount();

  const [data, setData] = useState({
    balance: '0',
    tierNumber: 0,
    isWhitelisted: false,
    maxLimit: 0,
    contributedAmountYet: 0,
    daoToken: '',
    goalReached: false,
    finalisedFundraising: false,
    endDate: '',
    fundraisingGoal: '',
    totalRaised: '',
    userTierLabel: 'None',
  });

  const refetch = async () => {
    if (chainId) {
      // const { getDaoInfo, getUserContributionInfo, getTierLimits } = useContribution({ chainId });
      const chainData = chainsData[chainId];
      const daoAddress = chainData.daoAddress;
      const tokenDetails = chainData.contribution.token;

      const getDaoInfo = async () => {
        return fetchDaoInfo({
          daoAddress,
          chainId,
          tokenDecimals: tokenDetails.decimals,
        });
      };

      const getUserContributionInfo = async () => {
        return fetchUserContributionInfo({
          account,
          daoAddress,
          chainId,
          tokenDecimals: tokenDetails.decimals,
        });
      };

      const getTierLimits = async (tier: number) => {
        return fetchTierLimits({
          chainId,
          tier,
          tokenDecimals: tokenDetails.decimals,
        });
      };

      const daoInfo = await getDaoInfo();

      let userContributionInfo: UserContributionInfo | undefined;
      let balance = BigInt(0);
      let tierLimit = 0;

      if (account) {
        const publicClient = getPublicClient(chainId);
        const [balanceRes, userContributionInfoRes] = await Promise.allSettled([
          daoInfo?.isPaymentTokenNative
            ? publicClient.getBalance({
                address: account,
              })
            : publicClient.readContract({
                abi: erc20Abi,
                address: tokenDetails.address,
                functionName: 'balanceOf',
                args: [account],
              }),
          getUserContributionInfo(),
        ]);

        if (balanceRes.status === 'fulfilled') {
          balance = balanceRes.value as bigint;
        } else {
          console.error('Balance fetch error:', balanceRes.reason);
        }
        if (userContributionInfoRes.status === 'fulfilled') {
          userContributionInfo = userContributionInfoRes.value;
          tierLimit = await getTierLimits(userContributionInfo.whitelistInfo.tier);
        } else {
          console.error('User contribution info fetch error:', userContributionInfoRes.reason);
        }
      }

      setData((prev) => ({
        ...prev,
        balance: formatUnits(balance, tokenDetails.decimals),
        tierNumber: userContributionInfo?.whitelistInfo.tier || 0,
        isWhitelisted: userContributionInfo?.whitelistInfo.isWhitelisted || false,
        contributedAmountYet: userContributionInfo?.contributions || 0,
        daoToken: daoInfo?.daoToken || '',
        goalReached: daoInfo?.goalReached || false,
        finalisedFundraising: daoInfo?.fundraisingFinalized || false,
        endDate: (Number(daoInfo?.fundraisingDeadline) * 1000).toString(),
        maxLimit: tierLimit,
        fundraisingGoal: daoInfo?.fundraisingGoal.toString() || '0',
        totalRaised: daoInfo?.totalRaised.toString() || '0',
        userTierLabel: userContributionInfo?.whitelistInfo.tier
          ? TIER_LABELS[userContributionInfo?.whitelistInfo.tier] || 'None'
          : 'None',
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refetch();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [account, chainId]);

  const refreshData = async () => {
    console.log('🔄 Refetching contract data...');
    await refetch();
  };
  return { data, refreshData };
};
