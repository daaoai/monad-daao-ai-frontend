'use client';
import { PageLayout } from '@/components/page-layout';
import React, { useState, useEffect } from 'react';
import UpcomingFunds from '@/components/dashboard/upcoming-card';
import BurnCard from '@/components/dashboard/burncard';
import { CURRENT_DAO_IMAGE, CURRENT_DAO_LINK } from '@/constants/links';
import { useAccount } from 'wagmi';
import { useFundContext } from '@/components/dashboard/FundContext';

const Upcoming: React.FC = () => {
  const { isConnected } = useAccount();
  const [fundraisingPercent, setFundraisingPercent] = useState<number>(0);
  const { fetchedData, totalContributed } = useFundContext();
  const [totalRaised, setTotalRaised] = useState(0);
  console.log('totalRaised', totalRaised);
  useEffect(() => {
    if (!isConnected || !fetchedData) return;
    console.log('Connected');
    const fundraisingGoal = fetchedData?.fundraisingGoal;
    const totalRaisedFund = fetchedData?.totalRaised;
    console.log('fetched data from this hhhhhhhhhhh is ', fetchedData);
    console.log('totalRaised before this hhhh is ', totalRaisedFund);
    setTotalRaised(Number(totalRaisedFund));
    console.log('totalRaised is hhhhhhhhhhhhhhhhhh ', totalRaisedFund);
    setFundraisingPercent((Number(totalRaisedFund) / Number(fundraisingGoal)) * 100);
    console.log('fundraisingPercent is hhhhhhhhhhhh ', fundraisingPercent);
  }, [isConnected, totalContributed, fetchedData]);

  const props = {
    longname: 'DeFAI Cartel',
    shortname: 'CARTEL',
    twitterUsername: 'DeFAICartel',
    twitterLink: 'https://x.com/DeFAICartel',
    telegramUsername: 'defaicartel',
    telegramLink: 'https://t.me/defaicartel',
    website: CURRENT_DAO_LINK,
    description:
      'DeFAI Venture DAO is a DeFAI Investment DAO dedicated to advancing the DeFAI movement by strategically investing in AI Agents and AI-focused DAOs on Mode. As a collective force in decentralized AI finance, $CARTEL empowers the AI-driven movement on Mode, fostering the growth of autonomous, AI-powered ecosystems.',
    aboutToken: `
      The raised funds will be used to invest in early DeFAI projects on Mode, and purchased allocations will be added to the treasury.

      $CARTEL raise will have two tiers:

      - GOLD Tier Limit: 12,000 $MODE
      - SILVER Tier Limit: 8,000 $MODE
    `,
    fundingProgress: parseInt(fundraisingPercent.toFixed(2)),
    logo: CURRENT_DAO_IMAGE,
  };

  return (
    <PageLayout title="App" description="main-app" app={true}>
      <div className={`overflow-hidden gap-20 flex flex-col justify-center items-center py-16 px-2`}>
        <div className="grid md:grid-cols-[55%_45%] gap-6 lg:gap-8">
          <UpcomingFunds {...props} />
          <BurnCard {...props} />
        </div>
      </div>
    </PageLayout>
  );
};

export default Upcoming;
