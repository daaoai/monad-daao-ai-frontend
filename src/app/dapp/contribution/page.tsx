'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PageLayout } from '@/components/page-layout';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';
import ClickToCopy from '@/components/copyToClipboard';
import { shortenAddress } from '@/utils/address';
import { useAccount } from 'wagmi';
import useContribution from '@/hooks/farm/useContribution';
import useTokenPrice from '@/hooks/useTokenPrice';
import { modeTokenAddress } from '@/constants/addresses';
import { toast as reactToast } from 'react-toastify';
const TIER_NAMES = {
  0: 'None',
  1: 'Silver',
  2: 'Gold',
  3: 'Platinum',
};

const TIER_COLORS = {
  0: 'bg-gray-800',
  1: 'bg-gray-400',
  2: 'bg-yellow',
  3: 'bg-gray-200',
};

export default function Page() {
  const { address } = useAccount();
  const { getDaoInfo, contribute, getTierLimits } = useContribution();
  const { fetchTokenPrice } = useTokenPrice();

  // Dynamic progress
  const [committed, setCommitted] = useState<number>(172);
  const [inputValue, setInputValue] = useState<string>('');
  const [fundraisingGoal, setFundraisingGoal] = useState<number>(0);
  const [modePrice, setModePrice] = useState<number>(0);
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

  const progressPercent = 80; // Fixed at 12.74% to match screenshot

  async function handleContribute() {
    const amount = Number.parseFloat(inputValue);

    if (!isNaN(amount) && amount > 0) {
      if (amount < 0.1) {
        reactToast.error('Amount should be lower than 0.1');
      }
      setCommitted((prev) => prev + amount);
      await contribute(Number(inputValue));
      setInputValue('');
    }
  }

  const fetchModePrice = async () => {
    try {
      const modePrice = await fetchTokenPrice(modeTokenAddress as `0x${string}`);
      setModePrice(Number(modePrice));
    } catch (err) {
      console.log({ err });
    }
  };

  const fetchTierLimits = async (tier: number) => {
    try {
      const tierLimits = await getTierLimits(tier);
      console.log({ tierLimits });
      setTierLimits(Number(tierLimits));
    } catch (err) {
      console.log({ err });
    }
  };

  useEffect(() => {
    const fetchDaoInfo = async () => {
      const daoInfo = await getDaoInfo();
      console.log(daoInfo, 'uyhgbnkiuh');
      if (daoInfo) {
        setDaoInfoData(daoInfo);
      }
      if (daoInfoData?.whitelistInfo.tier) {
        fetchTierLimits(daoInfoData?.whitelistInfo.tier);
      }
    };
    fetchDaoInfo();
    fetchModePrice();
  }, []);

  const totalRaisedPercentage = daoInfoData?.totalRaised
    ? (daoInfoData?.totalRaised / daoInfoData?.finalizeFundraisingGoal) * 100
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
                <div className="flex flex-col  items-start mb-1 justify-start">
                  <p className="text-[#C4F82A] font-medium">Total Raised</p>
                  <p className="text-sm font-bold">
                    {daoInfoData?.totalRaised} MONAD ($
                    {daoInfoData?.totalRaised ? (daoInfoData?.totalRaised * modePrice).toFixed(2) : 0})
                  </p>
                </div>

                <div className="flex items-start justify-start flex-col gap-2">
                  {/* <span className="text-white">Creator</span>
                  <div className="flex items-center gap-2">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-03-24%20at%209.00.01%E2%80%AFAM-2i8q88SqdShvxPua07QZcvNYtcbegG.png"
                      alt="Sorceror Artwork"
                      className="object-cover"
                      width={20}
                      height={20}
                    />
                    <a href="#" className="text-blue-400 text-xs underline">
                      eidiolabs
                    </a>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl">
              <div className="mb-4">
                <div className="w-full h-6 bg-[#1A1A1A] rounded-md overflow-hidden">
                  <div className="h-full bg-[#8B5CF6]" style={{ width: `${totalRaisedPercentage}%` }}></div>
                </div>
                <div className="text-right mt-2 text-sm">{totalRaisedPercentage}%</div>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient Address</span>
                  <div className="bg-[#053738] p-1 rounded-2xl flex gap-x-2 px-3">
                    {address && <p className="text-sm sm:text-base lg:text-lg">{shortenAddress(address)}</p>}
                    <ClickToCopy copyText={''} className="text-teal-20" />
                  </div>
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
              <div className="bg-black rounded-lg p-4 mb-8 border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-bold">
                    Tier {TIER_NAMES[Number(daoInfoData?.whitelistInfo?.tier ?? 0) as keyof typeof TIER_NAMES]}
                  </h3>
                  <div
                    className={`w-6 h-6 rounded-full ${TIER_COLORS[Number(daoInfoData?.whitelistInfo?.tier ?? 0) as keyof typeof TIER_COLORS]}`}
                  ></div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <p className="text-gray-400 mb-1">Max</p>
                    <p className="text-xl">{tierLimits}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Committed</p>
                    <p className="text-xl">{daoInfoData?.contributions}</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full">
                <Input
                  type="text"
                  placeholder="Enter the Amount"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="rounded-r-none text-black bg-white flex-1 h-10 text-lg"
                />
                <Button
                  onClick={handleContribute}
                  className="rounded-l-none bg-[#C4F82A] text-black hover:bg-[#D5FF3A] h-10 px-8 text-lg font-medium"
                >
                  Contribute
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
