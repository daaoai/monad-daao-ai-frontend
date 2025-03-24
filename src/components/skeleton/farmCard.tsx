import { Card, CardContent, CardFooter } from '@/shadcn/components/ui/card';
import { Skeleton } from '@/shadcn/components/ui/skeleton';
import { Wallet, DollarSign } from 'lucide-react';
import AnimatedSkeleton from '../animatedSkeleton';

const FarmCardSkeleton = () => {
  return (
    <Card className="box-border w-full max-w-[360px] bg-[#0d0d0d] border-[#383838] text-white flex flex-col">
      <CardContent className="p-6 flex flex-col gap-6 flex-grow">
        {/* Top Section: Title & Images */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative w-20 h-[50px] flex-shrink-0">
              <AnimatedSkeleton className="absolute left-0 top-0 w-[50px] h-[50px] rounded-full" />
              <AnimatedSkeleton className="absolute left-[30px] top-0 w-[50px] h-[50px] rounded-full" />
            </div>
            <div className="flex flex-col">
              <AnimatedSkeleton className="w-32 h-6 rounded-md" />
              <AnimatedSkeleton className="w-40 h-4 rounded-md mt-1" />
            </div>
          </div>
          <AnimatedSkeleton className="w-14 h-6 rounded-md" />
        </div>

        {/* APR & TVL */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <AnimatedSkeleton className="w-10 h-5" />
            <AnimatedSkeleton className="w-20 h-7" />
          </div>
          <div className="flex flex-col gap-1">
            <AnimatedSkeleton className="w-10 h-5" />
            <AnimatedSkeleton className="w-14 h-7" />
          </div>
        </div>

        {/* Divider */}
        <AnimatedSkeleton className="h-[1px] w-full bg-[#383838]" />

        {/* Stake & Earn Info */}
        <div className="text-left flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Wallet className="text-gray-400" />
            <AnimatedSkeleton className="w-40 h-5" />
          </div>
          <div className="flex items-center gap-4">
            <DollarSign className="text-gray-400" />
            <AnimatedSkeleton className="w-40 h-5" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-0">
        <AnimatedSkeleton className="w-full h-14 rounded-b-md" />
      </CardFooter>
    </Card>
  );
};

export default FarmCardSkeleton;
