'use client';
import { PageLayout } from '@/components/page-layout';
import React from 'react';
import { LeaderboardDataTable } from '@/components/table/leaderboard-table';
import { LeaderboardColumns } from '@/components/table/leaderboard-columns';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shadcn/components/ui/button';
import { leaderBoardData } from '@/constants/leaderboard';

const Leaderboard: React.FC = () => {
  return (
    <PageLayout title="App" description="main-app" app={true}>
      <div className="relative min-h-screen w-screen overflow-hidden">
        <div className="scale-110 sm:scale-100 mr-[-20%] sm:mr-[-30%] sm:mt-[-20%] absolute top-0 right-0 w-full h-full pointer-events-none z-0">
          <Image
            src="/public/assets/star-1-with-purple-star.svg"
            alt="Watermark"
            layout="fill"
            objectPosition="right top"
            className="object-contain"
          />
        </div>

        <div
          className={` relative flex flex-col justify-center items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-24`}
        >
          {/* Hero section */}
          <section className="flex flex-col justify-center items-center gap-6 md:gap-10 text-center max-w-4xl">
            <h1 className={`text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight`}>
              The future of investing in Daaos world
            </h1>
            <p className={`text-white text-base sm:text-lg md:text-xl lg:text-2xl font-normal tracking-wide`}>
              Create or join memecoin & AI hedgefunds
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md">
              <Link href="/dapp/dashboard" className="w-full sm:w-auto">
                <Button className="w-[125px] sm:w-auto bg-white text-black hover:bg-white/90 text-sm sm:text-base font-semibold px-6 py-2 sm:px-8 sm:py-3">
                  DASHBOARD
                </Button>
              </Link>
              <Link href="/dapp/leaderboard" className="w-full sm:w-auto">
                <Button className="w-1/3 sm:w-auto bg-[#28282c] hover:bg-[#28282c]/90 text-white text-sm sm:text-base font-semibold px-6 py-2 sm:px-8 sm:py-3">
                  LEADERBOARD
                </Button>
              </Link>
            </div>
          </section>

          <h1 className={`text-bold text-2xl pt-10`}>Top DAOs</h1>
          <div className="container mx-auto">
            <LeaderboardDataTable columns={LeaderboardColumns} data={leaderBoardData} />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Leaderboard;
