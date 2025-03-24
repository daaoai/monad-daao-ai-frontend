'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { ModalWrapper } from '@/components/modalWrapper';
import WithdrawFarms from '@/components/WithdrawFarm';
import DepositFarms from '@/components/DepositFarmModal';
import usePoolList from '@/hooks/farm/usePoolList';
import { useParams, useRouter } from 'next/navigation';
import { FarmPool } from '@/types/farm';
import useHarvest from '@/hooks/farm/useHarvest';
import { formatUnits, Hex } from 'viem';
import { abbreviateNumber } from '@/utils/numbers';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import { Badge } from '@/shadcn/components/ui/badge';
import ClickToCopy from '@/components/copyToClipboard';
import AnimatedSkeleton from '@/components/animatedSkeleton';
import { shortenAddress } from '@/utils/address';

const FarmStake = () => {
  const params = useParams();
  const address = params?.address as string;
  const router = useRouter();

  const { harvest } = useHarvest();
  const { getPoolDetails } = usePoolList();

  const [isPoolDetailsLoading, setIsPoolDetailsLoading] = useState(true);
  const [poolData, setPoolData] = useState<FarmPool>();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const openDepositModal = useCallback(() => setIsDepositModalOpen(true), []);
  const closeDepositModal = useCallback(() => setIsDepositModalOpen(false), []);
  const openWithdrawModal = useCallback(() => setIsWithdrawModalOpen(true), []);
  const closeWithdrawModal = useCallback(() => setIsWithdrawModalOpen(false), []);
  useEffect(() => {
    if (!address) return;
    fetchPoolDetails();
  }, [address]);

  const fetchPoolDetails = async () => {
    try {
      setIsPoolDetailsLoading(true);
      const response = await getPoolDetails({ poolAddress: address as `0x${string}` });
      if (response) {
        setPoolData(response);
      }
    } catch (error) {
      console.error('Error fetching pool details:', error);
    } finally {
      setIsPoolDetailsLoading(false);
    }
  };
  const handleHarvest = async () => {
    if (poolData?.unclaimedReward && poolData.unclaimedReward > BigInt(0)) {
      harvest({ poolAddress: address as Hex });
    }
  };
  const isHarvestDisabled = !poolData?.unclaimedReward || poolData?.unclaimedReward === BigInt(0);
  const now = Math.floor(Date.now() / 1000);
  const isActive = poolData && now >= Number(poolData.startTime || 0) && now <= Number(poolData.endTime || 0);
  const startDate = poolData?.startTime ? new Date(Number(poolData.startTime) * 1000) : null;
  const endDate = poolData?.endTime ? new Date(Number(poolData.endTime) * 1000) : null;
  const duration =
    startDate && endDate
      ? `${startDate.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })} - ${endDate.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        })}`
      : '';

  return (
    <div className="bg-black min-h-screen text-white w-full ">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2F2F2F] h-12">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-400 hover:text-white active:scale-95 transition-transform ease-in-out duration-150"
        >
          &larr; Back to Farms
        </button>
      </div>
      <div className="flex items-center justify-center p-4 mt-8">
        <div className="w-full max-w-lg bg-gray-50 border border-[#383838] rounded-lg p-5 shadow-md ">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">DeFAI Cartel</h2>
            {isPoolDetailsLoading ? (
              <AnimatedSkeleton className="w-10 h-4" />
            ) : (
              <Badge
                variant="secondary"
                className={`flex items-center gap-2 px-3 py-1 rounded-md font-rubik font-regular ${
                  isActive ? 'bg-teal-20 text-black' : 'bg-red-400 text-black'
                }`}
              >
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
          <div className="flex items-center mb-6 gap-2 bg-darkGreen p-2 rounded-md w-fit">
            {address ? (
              <span className="text-teal-20 text-sm">{shortenAddress(address)}</span>
            ) : (
              <AnimatedSkeleton className="w-40 h-4" />
            )}
            <ClickToCopy copyText={address} className="text-teal-20" />
          </div>
          <div className="flex flex-col gap-4 text-sm">
            <div
              className="flex justify-between items-center px-4 py-2
         bg-black border-b border-gray-20
         rounded-md shadow-md"
            >
              <p className="text-teal-70 font-rubik text-lg font-normal">APR</p>
              {isPoolDetailsLoading ? (
                <AnimatedSkeleton className="w-40 h-4" />
              ) : (
                <p className="text-white font-rubik text-lg">
                  {poolData?.apr ? Number(poolData.apr).toFixed(4) : '0.0000'}
                </p>
              )}
            </div>
            <div
              className="flex justify-between items-center px-4 py-2
         bg-black border-b border-gray-20
         rounded-md shadow-md"
            >
              <p className="text-teal-70 font-rubik text-lg font-normal">TVL</p>
              {isPoolDetailsLoading ? (
                <AnimatedSkeleton className="w-40 h-4" />
              ) : (
                <p className="text-white font-rubik text-lg">
                  $ {poolData?.totalStackedUSD ? abbreviateNumber(poolData.totalStackedUSD) : '0'}
                </p>
              )}
            </div>
            <div
              className="flex justify-between items-center px-4 py-2
         bg-black border-b border-gray-20
         rounded-md shadow-md"
            >
              <p className="text-teal-70 font-rubik text-lg font-normal">Pending Rewards</p>
              {isPoolDetailsLoading ? (
                <AnimatedSkeleton className="w-40 h-4" />
              ) : (
                <p className="text-white font-rubik text-lg font-normal">
                  {poolData?.unclaimedReward
                    ? abbreviateNumber(Number(Number(formatUnits(poolData.unclaimedReward, 18)).toFixed(2)))
                    : '0'}
                </p>
              )}
            </div>
            <div
              className="flex justify-between items-center px-4 py-2
         bg-black border-b border-gray-20
         rounded-md shadow-md"
            >
              <p className="text-teal-70 font-rubik text-lg">Staked CARTEL</p>
              {isPoolDetailsLoading ? (
                <AnimatedSkeleton className="w-40 h-4" />
              ) : (
                <p className="text-white font-rubik text-lg font-normal">
                  {poolData?.userInfo?.stackedAmount
                    ? abbreviateNumber(Number(formatUnits(poolData.userInfo.stackedAmount, 18)))
                    : '0'}
                </p>
              )}
            </div>
            <div
              className="flex justify-between items-center px-4 py-2
         bg-black border-b border-gray-20
         rounded-md shadow-md"
            >
              <p className="text-teal-70 font-rubik text-lg font-normal">Duration</p>
              {isPoolDetailsLoading ? (
                <Skeleton className="w-32 h-5" />
              ) : (
                <p className="text-white font-rubik text-lg">{duration || 'N/A'}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={openDepositModal}
              disabled={isPoolDetailsLoading}
              className={`flex-1 py-2 rounded-md font-semibold bg-white text-black active:scale-95 transition-transform ease-in-out duration-150 
              ${isPoolDetailsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-10'}`}
            >
              Deposit
            </button>
            <button
              onClick={openWithdrawModal}
              disabled={isPoolDetailsLoading}
              className={`flex-1 py-2 rounded-md font-semibold bg-teal-50 text-black active:scale-95 transition-transform ease-in-out duration-150
              ${isPoolDetailsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-40'}`}
            >
              Withdraw
            </button>
            <button
              onClick={handleHarvest}
              disabled={isHarvestDisabled || isPoolDetailsLoading}
              className={`flex-1 py-2 rounded-md font-semibold underline text-teal-50 active:scale-95 transition-transform ease-in-out duration-150
              ${isHarvestDisabled || isPoolDetailsLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#323435]'}`}
            >
              Harvest
            </button>
          </div>
        </div>
      </div>
      <ModalWrapper isOpen={isWithdrawModalOpen} onClose={closeWithdrawModal}>
        {poolData && <WithdrawFarms onClose={closeWithdrawModal} poolAddress={address as Hex} poolData={poolData} />}
      </ModalWrapper>
      <ModalWrapper isOpen={isDepositModalOpen} onClose={closeDepositModal}>
        <DepositFarms onClose={closeDepositModal} poolAddress={address as Hex} fetchPoolAddresses={fetchPoolDetails} />
      </ModalWrapper>
    </div>
  );
};

export default FarmStake;
