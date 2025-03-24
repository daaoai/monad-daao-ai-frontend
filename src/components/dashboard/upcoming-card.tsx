import Link from 'next/link';
import { Clock, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFundContext } from './FundContext';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/shadcn/components/ui/card';
import { Badge } from '@/shadcn/components/ui/badge';
import { Separator } from '@/shadcn/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/shadcn/components/ui/avatar';
import { Progress } from '@/shadcn/components/ui/progress';
import { UpcomingFundDetailsProps } from '@/types';

export default function UpcomingFunds(props: UpcomingFundDetailsProps) {
  const [endFTime, setEndFTime] = useState<number>(Date.now());
  const [fundrasingGoal, setFundraisingGoal] = useState<number>(0);
  const { fetchedData } = useFundContext();

  const getTimeRemaining = (endTime: number) => {
    console.log('endTime is ', endTime);
    const now = Date.now();
    console.log('now is ', now);
    const difference = endTime - now;

    if (difference <= 0) {
      return 'Event has ended';
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} days, ${hours} hours, ${minutes} minutes`;
  };

  useEffect(() => {
    if (fetchedData && fetchedData.endDate && fetchedData.fundraisingGoal) {
      setEndFTime(Number(fetchedData.endDate));
      setFundraisingGoal(Number(fetchedData.fundraisingGoal));
      console.log('fundrasisngGoal uyyyyyyyyyyyyyyyyy', fetchedData.fundraisingGoal);
    }
  }, [fetchedData]);

  return (
    <Card className="w-full max-w-3xl bg-[#0d0d0d] border-[#383838] text-white font-['Work Sans'] h-min">
      <CardHeader className="space-y-4 sm:space-y-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold">{props.longname}</h2>
          <Badge variant="secondary" className="text-[#409cff] text-base sm:text-lg lg:text-2xl font-semibold">
            ${props.shortname}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base lg:text-lg">
          <div className="flex items-center gap-1.5">
            <Link href={props.twitterLink} className="flex items-center gap-1.5">
              <Image src="/public/assets/x-icon.svg" alt="Telegram Icon" width={20} height={20} />
              <span className="text-[#92c5fd]">@{props.twitterUsername}</span>
            </Link>
          </div>
          <Link href={props.telegramLink} className="flex items-center gap-1.5">
            <Image src="/public/assets/telegram.svg" alt="Telegram Icon" width={20} height={20} />
            <span className="text-[#92c5fd]">t.me/{props.telegramUsername}</span>
          </Link>
          <Link href={props.website} className="flex items-center gap-1.5">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className=" text-[#92c5fd]">Website</span>
          </Link>
        </div>
      </CardHeader>
      <Separator className="bg-[#383838]" />
      <CardContent className="mt-4 sm:mt-6 lg:mt-7 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[100px] lg:h-[100px]">
            <AvatarImage src={props.logo} />
            <AvatarFallback>Logo</AvatarFallback>
          </Avatar>
          <p className="text-left text-base sm:text-lg lg:text-xl flex-1">{props.description}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {['Start Date', 'End Date'].map((label, index) => (
            <div key={label} className="space-y-2 sm:space-y-3">
              <label className="text-sm sm:text-base lg:text-lg">{label}</label>
              <div className="px-2 py-2 sm:py-3 bg-[#121212] rounded border border-[#383838] text-[#aeb3b6] text-xs sm:text-sm">
                <Clock className="inline-block w-4 h-4 mr-2" />
                {index === 0 ? 'Event has started!' : getTimeRemaining(endFTime)}
              </div>
            </div>
          ))}
        </div>
        {props.fundingProgress >= 100 ? (
          <div className="text-lg sm:text-xl font-semibold text-green-500">Funding Goal Reached 🎉</div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center text-sm sm:text-base lg:text-lg">
              <span>Funding Progress ({(fundrasingGoal / 10 ** 18).toFixed(0)} Mode)</span>
              <span>{props.fundingProgress}%</span>
            </div>
            <Progress
              value={props.fundingProgress >= 0 ? props.fundingProgress : 0}
              className="h-4 sm:h-5 [&>div]:bg-[#409cff] bg-[#2b4977]"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
