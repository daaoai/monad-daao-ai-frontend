'use client';
import { PageLayout } from '@/components/page-layout';
import { chainsData } from '@/config/chains';
import useContribution from '@/hooks/farm/useContribution';
import { useFetchBalance } from '@/hooks/useFetchBalance';
import useTokenPrice from '@/hooks/useTokenPrice';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { UserContributionInfo } from '@/types/contribution';
import { DaoInfo } from '@/types/dao';
import Decimal from 'decimal.js';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast as reactToast } from 'react-toastify';
import { formatUnits, Hex, parseUnits } from 'viem';
import { useAccount } from 'wagmi';

const TIER_TYPE: { [key: string]: string } = {
  '0': 'User not whitelisted, not allowed to contribute',
  '1': 'Platinum Tier',
  '2': 'Gold Tier',
  '3': 'Silver Tier',
};

export default function Page() {
  const { address: accountAddress, chainId: accountChainId } = useAccount();
  const account = accountAddress as Hex;
  const chainId = accountChainId!;
  const contributionTokenDetails = chainsData[chainId].contribution.token;
  const { getDaoInfo, contribute, getTierLimits, getUserContributionInfo, contributeWithToken } = useContribution({
    chainId,
  });
  const { fetchTokenPriceDexScreener } = useTokenPrice();
  const { data: fetchedData, refreshData } = useFetchBalance();
  const [inputValue, setInputValue] = useState<string>('');
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [daoInfoData, setDaoInfoData] = useState<DaoInfo | null>(null);
  const [userContributionInfo, setUserContributionInfo] = useState<UserContributionInfo | null>(null);
  const [tierLimits, setTierLimits] = useState<bigint>(BigInt(0));

  async function handleContribute() {
    if (!account) {
      reactToast.error('Please connect your wallet');
      return;
    }

    const formattedAmount = new Decimal(inputValue);
    if (!formattedAmount || isNaN(formattedAmount.toNumber()) || formattedAmount.toNumber() <= 0) {
      reactToast.error('Please enter a valid amount');
      return;
    }

    const amountInUnits = parseUnits(formattedAmount.toFixed(18), 18);

    if (amountInUnits > chainsData[chainId].contribution.maxAmount) {
      reactToast.error('Amount should be lower than 0.1');
      return;
    }

    const contributionLimit = tierLimits;
    const currentContributions = userContributionInfo?.contributions || BigInt(0);

    if (amountInUnits + currentContributions > contributionLimit) {
      // if (formattedAmount.plus(currentContributions).gt(contributionLimit)) {
      reactToast.error(`Contribution exceeds your tier limit of ${contributionLimit}`);
      return;
    }

    // Check user's balance against contribution amount
    if (fetchedData?.balance !== undefined) {
      const userBalance = Number(fetchedData.balance);
      if (formattedAmount.gt(userBalance)) {
        reactToast.error(
          `Insufficient balance. You have ${userBalance.toFixed(2)} ${contributionTokenDetails.name} available`,
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      daoInfoData?.isPaymentTokenNative ? await contribute(amountInUnits) : await contributeWithToken(amountInUnits);
      setInputValue('');
      refreshData();
      fetchDaoInfo();
    } catch (error) {
      console.error('Contribution error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchTokenPrice = async () => {
    try {
      const tokenPrice = await fetchTokenPriceDexScreener(contributionTokenDetails.address);
      setTokenPrice(Number(tokenPrice));
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchTierLimits = async (tier: number) => {
    try {
      const tierLimits = await getTierLimits(tier);
      setTierLimits(tierLimits);
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchDaoInfo = async () => {
    try {
      const daoInfo = await getDaoInfo();
      if (daoInfo) {
        setDaoInfoData(daoInfo);
      }
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchUserContributionInfo = async () => {
    try {
      const userInfo = await getUserContributionInfo();
      if (userInfo) {
        setUserContributionInfo(userInfo);
        if (userInfo.whitelistInfo.tier) {
          fetchTierLimits(userInfo.whitelistInfo.tier);
        }
      }
    } catch (err) {
      console.log({ err });
    }
  };

  useEffect(() => {
    if (account) {
      fetchUserContributionInfo();
    }
  }, [account]);

  useEffect(() => {
    fetchDaoInfo();
    fetchTokenPrice();
  }, []);

  // const totalRaisedPercentage = daoInfoData?.totalRaised
  //   ? (daoInfoData?.totalRaised / daoInfoData?.fundraisingGoal) * 100
  //   : 0;

  const totalRaisedPercentage = daoInfoData?.totalRaised
    ? new Decimal(daoInfoData?.totalRaised.toString())
        .dividedBy(daoInfoData?.fundraisingGoal.toString())
        .times(100)
        .toNumber()
    : 0;

  const totalRaisedFormatted = formatUnits(daoInfoData?.totalRaised || BigInt(0), contributionTokenDetails.decimals);
  const fundraisingGoalFormatted = formatUnits(
    daoInfoData?.fundraisingGoal || BigInt(0),
    contributionTokenDetails.decimals,
  );

  const contributionsFormatted = formatUnits(
    userContributionInfo?.contributions || BigInt(0),
    contributionTokenDetails.decimals,
  );
  const tierLimitsFormatted = formatUnits(tierLimits, contributionTokenDetails.decimals);

  const remainingContribution = Number(tierLimits) - Number(userContributionInfo?.contributions || 0) || 0;

  return (
    <PageLayout title="contribution" description="contribution">
      <div className="flex items-center justify-center p-4 bg-[#101010] border-gray-800 border rounded-xl mt-12">
        <div className="w-full max-w-3xl text-white">
          <div className="flex gap-6 mb-8">
            <div className="relative w-32 h-32 overflow-hidden rounded-lg">
              <Image src="/assets/testing.svg" alt="Sorceror Artwork" fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-left">Sorceror</h1>
              <p className="text-gray-400 text-base leading-relaxed text-left">
                Sorcerer is an investment DAO on Monad, that strategically fund AI agents and AI-driven projects,
                empowering the next wave of decentralized intelligence and autonomous ecosystems.
              </p>

              <div className="mt-8 flex justify-between">
                <div className="flex flex-col items-start mb-1 justify-start">
                  <p className="text-[#C4F82A] font-medium">Total Raised</p>
                  <p className="text-sm font-bold">
                    {totalRaisedFormatted} MONAD ($
                    {daoInfoData?.totalRaised ? Number(totalRaisedFormatted).toFixed(2) : 0})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div className="mb-4">
                <div className="w-full h-6 bg-[#1A1A1A] rounded-md overflow-hidden">
                  <div className="h-full bg-[#8B5CF6]" style={{ width: `${totalRaisedPercentage.toFixed(2)}%` }}></div>
                </div>
                <div className="text-right mt-2 text-sm">{totalRaisedPercentage.toFixed(2)}%</div>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Fundraising Deadline</span>
                  <p>
                    {new Date(Number(daoInfoData?.fundraisingDeadline)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funding Goal</span>
                  <span>
                    MONAD {fundraisingGoalFormatted} ($
                    {daoInfoData?.fundraisingGoal ? (Number(fundraisingGoalFormatted) * tokenPrice).toFixed(2) : 0})
                  </span>
                </div>
              </div>

              {!account ? (
                <div className="bg-yellow-800 text-yellow-200 p-4 rounded-lg mb-4">
                  Please connect your wallet to contribute
                </div>
              ) : !userContributionInfo?.whitelistInfo.isWhitelisted ? (
                <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-4">
                  Your address is not whitelisted for this contribution
                </div>
              ) : (
                <div className="bg-black rounded-lg p-4 mb-8 border border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold">
                      {TIER_TYPE[fetchedData?.tierNumber.toString() as keyof typeof TIER_TYPE]}
                    </h3>
                    <div className="w-6 h-6 rounded-full">
                      {userContributionInfo.whitelistInfo.tier !== undefined ? (
                        <img
                          src={
                            userContributionInfo.whitelistInfo.tier === 2
                              ? '/assets/gold-medal.svg'
                              : userContributionInfo.whitelistInfo.tier === 3
                                ? '/assets/silver-medal.svg'
                                : userContributionInfo.whitelistInfo.tier === 1
                                  ? '/assets/bronze-medal.svg'
                                  : undefined
                          }
                          alt="Tier Icon"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="bg-gray-20 w-full h-full rounded-full" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <p className="text-gray-400 mb-1">Max </p>
                      <p className="text-xl">{tierLimitsFormatted}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-400">Committed</p>
                      <p className="text-xl">{contributionsFormatted || 0}</p>
                    </div>
                  </div>
                </div>
              )}
              {daoInfoData?.goalReached ? (
                <p>Funding goal is reached, waiting for finalization...</p>
              ) : (
                <div className="flex w-full">
                  <Input
                    type="text"
                    placeholder="Enter the Amount"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="rounded-r-none text-black bg-white flex-1 h-10 text-lg"
                    disabled={!account || !userContributionInfo?.whitelistInfo.isWhitelisted || isLoading}
                  />
                  <Button
                    onClick={handleContribute}
                    className="rounded-l-none bg-[#C4F82A] text-black hover:bg-[#D5FF3A] h-10 px-8 text-lg font-medium"
                    disabled={!account || !userContributionInfo?.whitelistInfo.isWhitelisted || isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Contribute'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
