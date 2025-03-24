'use client';
import { PageLayout } from '@/components/page-layout';
import { NextPage } from 'next/types';
import React, { useEffect, useState } from 'react';
import { Typography } from '@/components/typography';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { CURRENT_DAO_IMAGE, DefaiCartelLinks, FUND_CARD_PLACEHOLDER_IMAGE, WHITEPAPER_URL } from '@/constants/links';
import { Link as UILink } from 'lucide-react';
import { FooterIconLink } from '@/components/footer';
import CheckWaitlistModal from '@/components/landing/waitlist-modal';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { Button } from '@/shadcn/components/ui/button';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { formatNumber } from '@/utils/numbers';
import { daoAddress } from '@/constants/addresses';
import { FundSection } from '@/components/dashboard/fundsection';
import type { Fund } from '@/types/fund';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ConnectWalletButton } from '@/components/connect-button';
import PoolDetailCard from '@/components/poolDetailCard';
import FAQDaao from '@/components/faqDaao';
import { useFetchBalance } from '@/hooks/useFetchBalance';

const HomePage: NextPage = () => {
  const [price, setPrice] = useState<number | null>(0);
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [liquidity, setLiquidity] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { toast } = useToast();
  const { data: fetchedData, refreshData } = useFetchBalance(address);
  console.log({ fetchedData: fetchedData.finalisedFundraising });
  const isFinalised = fetchedData.finalisedFundraising;
  useEffect(() => {
    const modeRpc = 'https://testnet-rpc.monad.xyz';
    const fetchMarketData = async () => {
      const provider = new ethers.providers.JsonRpcProvider(modeRpc);

      // const signer = provider.getSigner();

      const contract = new ethers.Contract(daoAddress as string, CONTRACT_ABI, provider);
      const daoToken = await contract.daoToken();
      // setDaoTokenAddress(daoToken)
      // if (!daoTokenAddress) return

      // const url = `https://api.dexscreener.com/token-pairs/v1/mode/${daoTokenAddress}`
      const url = `https://api.dexscreener.com/token-pairs/v1/mode/${daoToken}`;
      console.log('url is ', url);
      try {
        // Replace with your actual endpoint or logic
        const response = await fetch(url);
        const data = await response.json();
        console.log('Data from api is  is ', data);

        if (data && Array.isArray(data) && data[0]) {
          setPrice(data[0].priceUsd);
          const marketCap = Number(data[0].marketCap).toFixed(0);
          const liq = Number(data[0].liquidity?.usd).toFixed(0);
          const volume = Number(data[0].volume?.h24).toFixed(0);
          setMarketCap(Number(marketCap));
          setLiquidity(Number(liq));
          setVolume(Number(volume));
        } else {
          console.warn('Market data not in expected format.');
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    fetchMarketData();
  }, []);

  const getFeaturedFunds = (): Fund[] => {
    return [
      {
        id: '1',
        title: 'Sorcerer',
        token: 'Sorcerer',
        status: 'trading',
        imgSrc: '/assets/testing.svg',
      },
      {
        id: '178',
        title: 'To Be Announced',
        token: 'TBA',
        status: 'soon',
        imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
      },
      {
        id: '179',
        title: 'To Be Announced',
        token: 'TBA',
        status: 'soon',
        imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
      },
    ];
  };

  const getUpcomingFunds = (): Fund[] => {
    return [
      {
        id: '181',
        title: 'Coming Soon',
        status: 'soon',
        imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
      },
      {
        id: '182',
        title: 'Coming Soon',
        status: 'soon',
        imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
      },
      {
        id: '183',
        title: 'Coming Soon',
        status: 'soon',
        imgSrc: FUND_CARD_PLACEHOLDER_IMAGE,
      },
    ];
  };

  const FEATURED_FUNDS: Fund[] = getFeaturedFunds();
  const UPCOMING_FUNDS: Fund[] = getUpcomingFunds();

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

    if (isFinalised) {
      // If finalised, redirect to the fund page
      router.push(`/dapp/${fundId}`);
    } else {
      // If not finalised, redirect to the contribution page
      router.push('/dapp/contribution');
    }

    // Navigate to the fund page if connected
    // router.push(`/dapp/${fundId}`);
  };
  const redirectToDashboard = () => {
    router.push('/dapp/1');
  };

  return (
    <PageLayout>
      <div className="relative">
        {/* Background image */}
        <div className="absolute inset-0 z-0 top-[22rem] pt-[23rem] -left-[8rem]">
          <Image
            src="/assets/brand.svg"
            alt="Background Asset"
            layout="fill"
            objectFit="cover"
            className=" absolute opacity-80"
          />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10 lg:gap-20 w-full pt-24 items-center">
          <Image
            src="/assets/testing.svg"
            alt="defai-cartel"
            width={400}
            height={400}
            onClick={redirectToDashboard}
            className="cursor-pointer"
          />
          <div className="flex flex-col sm:items-start gap-6">
            <p className="text-5xl font-sora font-medium text-white">Sorcerer</p>
            <Link
              href="https://velodrome.finance/swap?from=0xdfc7c877a950e49d2610114102175a06c2e3167a&to=0x98e0ad23382184338ddcec0e13685358ef845f30&chain0=34443&chain1=34443"
              className="text-teal-60 font-normal"
            >
              Trade On Velodrome
            </Link>
            <p className="text-gray-10 font-normal font-rubik text-lg text-left">
              Sorcerer is an investment DAO on Monad, that strategically fund AI agents and AI-driven projects,
              empowering the next wave of decentralized intelligence and autonomous ecosystems.
            </p>
            <PoolDetailCard marketCap={marketCap || 0} liquidity={liquidity || 0} volume={volume || 0} />
          </div>
        </div>
      </div>

      <div className="mb-18 mt-32 w-full flex flex-col gap-5">
        <p className="text-white font-regular text-3xl md:text-5xl">&lt;&lt;&lt;Featured Funds&gt;&gt;&gt;</p>
        <FundSection funds={FEATURED_FUNDS} onFundClick={(fundId) => onFundClick(fundId, 'dashboard')} />
      </div>

      <div className="my-24 flex flex-col gap-5 w-full">
        <p className="text-white font-regular text-3xl md:text-5xl">&lt;&lt;&lt;Upcoming Funds&gt;&gt;&gt;</p>
        <FundSection funds={UPCOMING_FUNDS} onFundClick={(fundId) => onFundClick(fundId, 'dashboard')} />
      </div>

      <div className="relative w-full">
        <div className="absolute inset-0 z-0 -left-[13rem]">
          <Image
            src="/assets/brand.svg"
            alt="Background Asset"
            layout="fill"
            className="absolute opacity-90  filter blur-sm"
          />
        </div>
        <div className="flex flex-col gap-16 items-center justify-center">
          <Image src="/assets/circle-image.svg" alt="defai-cartel" width={300} height={400} />
          <div className="flex flex-col gap-8 items-center z-10">
            <p className="text-teal-40 font-normal font-sora text-2xl md:text-4xl">Available to everyone</p>
            <p className="text-3xl sm:text-4xl lg:text-7xl font-sora font-normal text-white max-w-4xl">
              Launch your next fund on D.A.A.O
            </p>
            {/* <div className='bg-'> */}
            <Link href="https://t.me/arcanelabs" className="text-black w-fit bg-white rounded-full px-4 py-2">
              Launch A DAO
            </Link>
            {/* </div> */}
          </div>
        </div>
      </div>

      <div className="w-full md:w-8/12 max-w-xl flex items-center flex-col mt-20">
        <p className="text-center text-3xl font-bold">FAQs</p>
        <FAQDaao />
      </div>

      {/* <div className="sm:my-[-40px] relative flex justify-center items-center h-max">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Typography variant="h1" className={`text-center text-white text-3xl md:text-5xl lg:text-6xl`}>
            Decentralized Autonomous
            <br />
            Agentic Organization
          </Typography>
          <Typography
            variant="h3"
            className={`lg:pt-6 pt-2 text-center text-white lg:text-xl w-5/6 md:text-lg text-sm`}
          >
            Where autonomous agents meet decentralized innovation, driving seamless collaboration for a smarter future.
          </Typography>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 w-min">
            <Link href={WHITEPAPER_URL} target="_blank" className="w-full">
              <Button
                variant="default"
                className={`w-full py-4 sm:py-6 px-6 sm:px-10 bg-white rounded-lg border border-[#bedaff] flex justify-center items-center max-w-xs sm:max-w-none`}
              >
                <div className={`text-center text-black text-base sm:text-xl font-normal leading-tight tracking-wide`}>
                  Whitepaper
                </div>
              </Button>
            </Link>
            <Link href="/dapp" className="w-full">
              <Button
                variant="ghost"
                className={`py-4 sm:py-6 px-6 sm:px-10 bg-transparent rounded-lg xl border border-[#bedaff] flex justify-center items-center max-w-xs sm:max-w-none`}
              >
                <div className="flex justify-center items-center gap-2 text-center text-white text-sm sm:text-base font-normal goldman leading-tight tracking-wide">
                  Go to app <ArrowRight />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div> */}

      {/* <CheckWaitlistModal isOpen={isOpen} setIsOpen={setIsOpen} /> */}

      {/*waitlist*/}
      {/* <Card className="w-[calc(100%-2rem)] max-w-[500px] bg-gradient-to-br from-black via-[#061023] to-[#0e070e] rounded-2xl shadow-[0px_4px_36px_0px_rgba(255,255,255,0.10)] border border-[#212121]">
        <CardContent className="flex flex-col items-center justify-center gap-6 p-6 sm:p-8">
          <div className="relative w-full max-w-[250px] aspect-square rounded-xl overflow-hidden">
            <Image src={CURRENT_DAO_IMAGE} alt="DeFAI Cartel" layout="fill" objectFit="cover" />
          </div>
          <Link href="/dapp">
            <div className="flex flex-col items-center gap-2">
              <h2 className={`text-center text-white text-xl sm:text-2xl font-normal  leading-tight tracking-wide`}>
                DeFAI Cartel
              </h2>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex gap-4">
                  <p className={`text-white text-sm sm:text-base `}>
                    Price: <span className="text-[#d1ea48]">$ {Number(price).toFixed(6)}</span>
                  </p>
                  <p className={`text-white text-sm sm:text-base`}>
                    MCAP: <span className="text-[#d1ea48]">{formatNumber(Number(marketCap || 0))}</span>
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="https://velodrome.finance/swap?from=0xdfc7c877a950e49d2610114102175a06c2e3167a&to=0x98e0ad23382184338ddcec0e13685358ef845f30&chain0=34443&chain1=34443"
            target="_blank"
          >
            <div className="flex items-center gap-1.5 justify-center bg-blue-950 p-2 rounded-md border-2 border-[#d1ea48] animate-pulse transition-all duration-2000 hover:scale-105">
              <span className={`text-[#d1ea48] text-sm`}>Trade On Velodrome</span>
              <ArrowRight className="w-4 h-4 text-[#d1ea48]" />
            </div>
          </Link>

          <div className="flex flex-wrap justify-center gap-4">
            {DefaiCartelLinks.map((social, index) => (
              <FooterIconLink key={index} href={social.href} label={social.label}>
                {!social.src ? <UILink /> : <Image src={social.src} alt={social.alt} width={20} height={20} />}
              </FooterIconLink>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </PageLayout>
  );
};

export default HomePage;
