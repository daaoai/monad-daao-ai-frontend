import { ArrowRight, Wallet, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatUnits } from 'viem';
import { abbreviateNumber } from '@/utils/numbers';
import { CURRENT_DAO_IMAGE, tokenImageLinks } from '@/constants/links';
import { Badge } from '@/shadcn/components/ui/badge';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import { Separator } from '@/shadcn/components/ui/separator';
import { FarmPool } from '@/types/farm';

interface FarmCardProps {
  farm: FarmPool;
  isLoading: boolean;
}

const FarmCard = ({ farm, isLoading }: FarmCardProps) => {
  const { depositToken, startTime, endTime, apr, totalStackedUSD, totalStackedAmount, rewards, poolAddress } = farm;

  const startTimeMs = Number(startTime.toString()) * 1000;
  const endTimeMs = Number(endTime.toString()) * 1000;
  const now = Date.now();
  const isActive = now >= startTimeMs && now <= endTimeMs;

  const formatDate = (timestamp: number) =>
    new Date(timestamp)
      .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
      .replace(' ', '/');

  const description = `${formatDate(startTimeMs)} - ${formatDate(endTimeMs)}`;
  // const description = `Active from ${formatDate(startTimeMs)} until ${formatDate(endTimeMs)}`;

  const name = `Farm Pool (${depositToken.slice(0, 6)}...)`;
  const aprFormatted = `${apr.toFixed(2)}%`;
  const tvlFormatted = abbreviateNumber(totalStackedUSD);
  const stakeInfo = formatUnits(totalStackedAmount, 18);
  const earnInfo = formatUnits(rewards.remainingRewards, 18);

  return (
    <Card className="box-border w-full max-w-[360px] bg-[#0d0d0d] border-[#383838] text-white flex flex-col">
      <CardContent className="p-6 flex flex-col gap-6 flex-grow">
        <div className="flex  gap-4 justify-between items-start">
          <div className="flex flex-col md:flex-row items-start gap-3">
            <div className="relative w-20 h-[50px] flex-shrink-0">
              <Image
                src={tokenImageLinks[farm.rewardTokenName.toUpperCase() as keyof typeof tokenImageLinks]}
                alt="Reward Token"
                width={16}
                height={16}
                className="absolute left-0 top-0 w-[50px] h-[50px] rounded-full"
              />
              <Image
                src={CURRENT_DAO_IMAGE}
                alt="Deposit Token"
                width={16}
                height={16}
                className="absolute left-[30px] top-0 w-[50px] h-[50px] rounded-full"
              />
            </div>
            <div className="flex items-start gap-1">
              <h2 className="text-md font-bold">${farm.depositTokenName}</h2>
              <h2 className="text-md font-bold">${farm.rewardTokenName}</h2>

              {/* <p className="text-gray-70 text-sm">{description}</p> */}
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`flex items-center gap-2 px-3 py-1 rounded-md font-rubik font-regular ${
              isActive ? 'bg-teal-20 text-black' : 'bg-red-400 text-black'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-1 items-start">
              <p className="text-lg font-normal text-midGreen font-sora">APR</p>
              <p className="text-2xl font-medium font-rubik">{aprFormatted}</p>
            </div>
            <div className="flex flex-col gap-1 items-start">
              <p className="text-lg font-normal text-midGreen font-sora">TVL</p>
              <p className="text-2xl font-medium font-rubik">$ {tvlFormatted}</p>
            </div>
          </div>
          <Separator className="bg-[#383838]" />
          <div className="text-left flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <Wallet className="text-midGreen" width={18} height={18} />
              <p className="text-sm text-midGreen font-rubik">
                Total Staked CARTEL : {abbreviateNumber(Number(stakeInfo))} CARTEL
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DollarSign className="text-midGreen" width={18} height={18} />
              <p className="text-sm text-midGreen font-rubik">
                Total Remaining Rewards : {abbreviateNumber(Number(earnInfo))} {farm.rewardTokenName}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <Link
        href={`/dapp/farms/mode/${poolAddress}`}
        className="text-lg text-black sm:text-xl py-2 font-sora font-semibold bg-teal-50 mt-2 mx-6 rounded-md active:scale-95 transition-transform ease-in-out duration-150"
      >
        View
      </Link>
      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-black rotate-[320deg]" />
    </Card>
  );
};

export default FarmCard;
