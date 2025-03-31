'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PageLayout } from '@/components/page-layout';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';
import { useAccount } from 'wagmi';
import useContribution from '@/hooks/farm/useContribution';
import useTokenPrice from '@/hooks/useTokenPrice';
import { wmonTokenAddress } from '@/constants/addresses';
import { toast as reactToast } from 'react-toastify';
import { formatUnits } from 'viem';
import { useFetchBalance } from '@/hooks/useFetchBalance';

const TIER_TYPE: { [key: string]: string } = {
  '0': 'User not whitelisted, not allowed to contribute',
  '1': 'Platinum Tier',
  '2': 'Gold Tier',
  '3': 'Silver Tier',
};

export default function Page() {
  const { address } = useAccount();
  const { getDaoInfo, contribute, getTierLimits, checkWhitelist } = useContribution();
  const { fetchTokenPrice } = useTokenPrice();
  const { data: fetchedData, refreshData } = useFetchBalance(address);

  const [inputValue, setInputValue] = useState<string>('');
  const [fundraisingGoal, setFundraisingGoal] = useState<number>(0);
  const [modePrice, setModePrice] = useState<number>(0);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [daoInfoData, setDaoInfoData] = useState<{
    finalizeFundraisingGoal: number;
    totalRaised: number;
    whitelistInfo: {
      isWhitelisted: boolean;
      tier: number;
      limit: number;
    };
    contributions: number;
  } | null>(null);
  const [tierLimits, setTierLimits] = useState<number>(0);

  async function handleContribute() {
    if (!address) {
      reactToast.error('Please connect your wallet');
      return;
    }

    // Check if user is whitelisted
    const whitelistStatus = await checkWhitelist();
    if (!whitelistStatus) {
      reactToast.error('Account is not whitelisted');
      return;
    }

    const amount = Number.parseFloat(inputValue);
    if (!amount || isNaN(amount) || amount <= 0) {
      reactToast.error('Please enter a valid amount');
      return;
    }

    if (amount > 0.1) {
      reactToast.error('Amount should be lower than 0.1');
      return;
    }

    // Check user's remaining contribution limit
    const contributionLimit = Number(formatUnits(BigInt(tierLimits), 18));
    const currentContributions = daoInfoData?.contributions || 0;

    if (amount + currentContributions > contributionLimit) {
      reactToast.error(`Contribution exceeds your tier limit of ${contributionLimit}`);
      return;
    }

    // // Check user's balance against contribution amount
    // if (fetchedData?.balance !== undefined) {
    //   const userBalance = Number(fetchedData.balance);
    //   if (amount > userBalance) {
    //     reactToast.error(`Insufficient balance. You have ${userBalance.toFixed(2)} MONAD available`);
    //     return;
    //   }
    // }

    setIsLoading(true);
    try {
      await contribute(amount);
      setInputValue('');
      refreshData();
      fetchDaoInfo();
    } catch (error) {
      console.error('Contribution error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const fetchModePrice = async () => {
    try {
      const modePrice = await fetchTokenPrice(wmonTokenAddress as `0x${string}`);
      setModePrice(Number(modePrice));
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchTierLimits = async (tier: number) => {
    try {
      const tierLimits = await getTierLimits(tier);
      setTierLimits(Number(tierLimits));
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchDaoInfo = async () => {
    try {
      const daoInfo = await getDaoInfo();
      if (daoInfo) {
        setDaoInfoData(daoInfo);
        setIsWhitelisted(daoInfo.whitelistInfo.isWhitelisted);
        if (daoInfo.whitelistInfo.tier) {
          fetchTierLimits(daoInfo.whitelistInfo.tier);
        }
      }
    } catch (err) {
      console.log({ err });
    }
  };

  useEffect(() => {
    const checkUserWhitelist = async () => {
      if (address) {
        const whitelistStatus = await checkWhitelist();
        setIsWhitelisted(whitelistStatus);
      }
    };

    fetchDaoInfo();
    fetchModePrice();
    checkUserWhitelist();
  }, [address]);

  const totalRaisedPercentage = daoInfoData?.totalRaised
    ? (daoInfoData?.totalRaised / daoInfoData?.finalizeFundraisingGoal) * 100
    : 0;

  const remainingContribution = tierLimits
    ? Number(formatUnits(BigInt(tierLimits), 18)) - (daoInfoData?.contributions || 0)
    : 0;

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
                    {daoInfoData?.totalRaised} MONAD ($
                    {daoInfoData?.totalRaised ? (daoInfoData?.totalRaised * modePrice).toFixed(2) : 0})
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
                    {new Date(Number(fetchedData.endDate)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Funding Goal</span>
                  <span>
                    MONAD {daoInfoData?.finalizeFundraisingGoal} ($
                    {daoInfoData?.finalizeFundraisingGoal
                      ? (daoInfoData?.finalizeFundraisingGoal * modePrice).toFixed(2)
                      : 0}
                    )
                  </span>
                </div>
              </div>

              {!address ? (
                <div className="bg-yellow-800 text-yellow-200 p-4 rounded-lg mb-4">
                  Please connect your wallet to contribute
                </div>
              ) : !isWhitelisted ? (
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
                      {daoInfoData?.whitelistInfo.tier !== undefined ? (
                        <img
                          src={
                            daoInfoData.whitelistInfo.tier === 2
                              ? '/assets/gold-medal.svg'
                              : daoInfoData.whitelistInfo.tier === 3
                                ? '/assets/silver-medal.svg'
                                : daoInfoData.whitelistInfo.tier === 1
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
                      <p className="text-xl">{formatUnits(BigInt(tierLimits), 18)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-400">Committed</p>
                      <p className="text-xl">{daoInfoData?.contributions || 0}</p>
                    </div>
                  </div>
                </div>
              )}
              {fetchedData.goalReached ? (
                <p>Funding goal is reached, waiting for finalization...</p>
              ) : (
                <div className="flex w-full">
                  <Input
                    type="text"
                    placeholder="Enter the Amount"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="rounded-r-none text-black bg-white flex-1 h-10 text-lg"
                    disabled={!address || !isWhitelisted || isLoading}
                  />
                  <Button
                    onClick={handleContribute}
                    className="rounded-l-none bg-[#C4F82A] text-black hover:bg-[#D5FF3A] h-10 px-8 text-lg font-medium"
                    disabled={!address || !isWhitelisted || isLoading}
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
