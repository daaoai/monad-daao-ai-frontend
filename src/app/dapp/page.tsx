'use client';
import React from 'react';
import Image from 'next/image';
import { PageLayout } from '@/components/page-layout';
import { FundSection } from '@/components/dashboard/fundsection';
import { CURRENT_DAO_IMAGE, FUND_CARD_PLACEHOLDER_IMAGE } from '@/constants/links';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ConnectWalletButton } from '@/components/connect-button';
import starIcon from '/public/assets/hero_star_icon.png';
import { Fund } from '@/types/fund';

// const getFeaturedFunds = (): Fund[] => {
//   return [
//     {
//       id: '1',
//       title: 'DeFAI Cartel',
//       token: 'CARTEL',
//       status: 'trading',
//       imgSrc: CURRENT_DAO_IMAGE,
//     },
//     {
//       id: '178',
//       title: 'To Be Announced',
//       token: 'TBA',
//       status: 'soon',
//       imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
//     },
//     {
//       id: '179',
//       title: 'To Be Announced',
//       token: 'TBA',
//       status: 'live',
//       imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
//     },
//     // { id: '435', title: 'Soul Dogs', token: 'FDREMA', status: false, imgSrc: FUND_CARD_PLACEHOLDER_IMAGE },
//   ];
// };

const AppHome: React.FC = () => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { toast } = useToast();
  console.log(isConnected);
  // const FEATURED_FUNDS: Fund[] = getFeaturedFunds();
  // const UPCOMING_FUNDS = getUpcomingFunds();

  const onFundClick = (fundId: string, type: 'dashboard' | 'upcoming') => {
    if (!isConnected) {
      // alert('Please connect your wallet first.');
      toast({
        title: 'Please connect your wallet first',
        description: "It looks like your wallet isn't connected",
        variant: 'destructive',
        action: <ConnectWalletButton icons={false} className="bg-white text-black" />,
      });
      return;
    }
    // Navigate to the fund page if connected
    router.push(`/dapp/${type}/${fundId}`);
  };

  return (
    <PageLayout title="App" description="main-app" app={true}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="app_main_container">
          <div className="hero_section_main_container">
            <div className="hero_section_container">
              <div className="bg_image_container">
                <div className="bg_image">
                  <Image src={starIcon} height={30} width={30} alt="@startIcon" className="hero_star_icon" />
                  <div className="content_container">
                    <div className="heading text-center text-white text-3xl md:text-5xl lg:text-5xl font-semibold">
                      The future of investing in Daaos world
                    </div>
                    <div className="description lg:pt-6 pt-2 text-center text-white lg:text-2xl w-5/6 md:text-lg text-sm w-full">
                      Create or join memecoin & AI hedgefunds
                    </div>
                    {/* <div className="btn_container flex justify-center mt-5">
                      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 w-min">
                        <Button
                          variant="connect"
                          className={`w-full py-4 sm:py-6 px-6 sm:px-10 bg-white rounded-md border border-[#bedaff] flex justify-center items-center max-w-xs sm:max-w-none`}
                          disabled={true}
                        >
                          <Link
                            // href={WHITEPAPER_URL}
                            href='/dapp'
                            target="_blank"
                            className="w-full"
                          >

                            <div className={`text-center text-black text-base sm:text-xl  font-sans font-semibold leading-tight tracking-wide`}>
                              DASHBOARD
                            </div>
                          </Link>
                        </Button>
                        <Button
                          variant="connect"
                          className={`py-4 sm:py-6 px-6 sm:px-10 bg-[#28282C] rounded-md xl border border-[#28282C] flex justify-center items-center max-w-xs sm:max-w-none`}
                          disabled={true}
                        >
                          <Link
                            href="/leaderboard"
                            className="w-full"
                          >

                            <div className="flex justify-center items-center gap-2 text-center  sm:text-xl font-sans font-semibold text-white text-sm   goldman leading-tight tracking-wide">

                              LEADERBOARD
                            </div>
                          </Link>
                        </Button>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={` features_cards_main_container relative flex flex-col justify-center items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-12 md:space-y-24`}
          >
            {/* Featured funds */}
            {/* <FundSection
              title="Featured Funds"
              subtitle="In-demand hedgefunds"
              funds={FEATURED_FUNDS}
              onFundClick={(fundId) => onFundClick(fundId, 'dashboard')}
            /> */}

            {/* Upcoming funds */}
            {/* <FundSection
              title="Launched DAOs"
              subtitle="Launching soon"
              funds={UPCOMING_FUNDS}
              linkPrefix="upcoming"
              onFundClick={(fundId) => onFundClick(fundId, 'upcoming')}
            /> */}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AppHome;
