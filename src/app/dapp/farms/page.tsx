'use client';
import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/page-layout';
import usePoolList from '@/hooks/farm/usePoolList';
import { FarmPool } from '@/types/farm';
import FarmTabs from '@/components/farms/farmTabs';
import Image from 'next/image';

const Farms: React.FC = () => {
  const { getPoolList } = usePoolList();
  const [isPoolListLoading, setIsPoolListLoading] = useState(true);
  const [farmPools, setFarmPools] = useState<FarmPool[]>([]);

  useEffect(() => {
    const fetchPoolAddresses = async () => {
      try {
        setIsPoolListLoading(true);
        const responsePoolList = await getPoolList();
        setFarmPools(responsePoolList);
        setIsPoolListLoading(false);
      } catch (error) {
        console.error('Error fetching pool addresses:', error);
        setIsPoolListLoading(false);
      }
    };
    fetchPoolAddresses();
  }, []);

  const isFarmActive = (farm: FarmPool) => {
    const startTimeMs = Number(farm.startTime.toString()) * 1000;
    const endTimeMs = Number(farm.endTime.toString()) * 1000;
    const now = Date.now();
    return now >= startTimeMs && now <= endTimeMs;
  };

  const activeFarms = farmPools.filter(isFarmActive);
  const inactiveFarms = farmPools.filter((farm) => !isFarmActive(farm));

  return (
    <PageLayout title="App" description="main-app">
      <div className="w-full overflow-hidden gap-y-20 flex flex-col justify-center items-center pt-16 pb-16">
        <div className="container mx-auto px-4 py-8 relative">
          <div className="absolute inset-0 z-0 top-[24rem] pt-[18rem]">
            <Image
              src="/assets/brand.svg"
              alt="Background Asset"
              layout="fill"
              objectFit="cover"
              className=" absolute opacity-80"
            />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-8 text-center font-sora">
            &lt;&lt;&lt;Farming Pools&gt;&gt;&gt;
          </h1>
          <FarmTabs activeFarms={activeFarms} inactiveFarms={inactiveFarms} isLoading={isPoolListLoading} />
        </div>
      </div>
    </PageLayout>
  );
};

export default Farms;
