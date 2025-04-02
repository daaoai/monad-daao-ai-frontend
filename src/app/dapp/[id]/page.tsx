'use client';
import BuySellCard from '@/components/dashboard/BuySellCard';
import FundDetails from '@/components/dashboard/fundcard-details';
import { useFundContext } from '@/components/dashboard/FundContext';
import { PageLayout } from '@/components/page-layout';
import { CURRENT_DAO_IMAGE } from '@/constants/links';
import { useFetchBalance } from '@/hooks/useFetchBalance';
import useTokenPrice from '@/hooks/useTokenPrice';
import type { FundDetailsProps } from '@/types';
import type { Asset } from '@/types/dashboard';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Hex } from 'viem';
import { useAccount } from 'wagmi';

export interface Token {
  address: string;
  circulating_market_cap: number | null;
  decimals: string;
  exchange_rate: number | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: string;
  volume_24h: number | null;
}
export interface TokenBalance {
  token: Token;
  token_id: string | null;
  token_instance: string | null;
  value: string;
}
export type ApiResponse = TokenBalance[];

export interface Token {
  address: string;
  circulating_market_cap: number | null;
  decimals: string;
  exchange_rate: number | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: string;
  volume_24h: number | null;
}

export interface TokenBalance {
  token: Token;
  token_id: string | null;
  token_instance: string | null;
  value: string;
}

// DEXScreener API types
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
}

export interface DexScreenerResponse {
  pairs: DexScreenerPair[];
}

// Combined token data with price
export interface TokenWithPrice extends TokenBalance {
  priceUsd?: string;
}

export type EnhancedApiResponse = TokenWithPrice[];

const formatDaoHoldingTokens = (daoTokens: EnhancedApiResponse): Asset[] => {
  return daoTokens
    .filter((item) => item.token.symbol !== 'CARTELTEST')
    .map((item) => {
      const decimals = Number(item.token.decimals);
      const balance = Number(item.value) / Math.pow(10, decimals);
      const price = item.priceUsd ? Number(item.priceUsd) : 0;
      return {
        token: item.token.symbol,
        // tokenIcon: item.token.icon_url ?? "",
        balance: balance,
        price: price,
        totalValue: price * balance,
      };
    });
};

const Dashboard: React.FC = () => {
  const { data: fetchedData, refreshData } = useFetchBalance();
  const [daoTokenAddress, setDaoTokenAddress] = useState('');
  const [daaoHoldingTokens, setDaoHoldingTokens] = useState<ApiResponse | null>(null);
  const { fetchTokenPriceDexScreener } = useTokenPrice();

  const { daoBalance, priceUsd } = useFundContext();
  useEffect(() => {
    if (!fetchedData) return;
    if (!daoTokenAddress) {
      setDaoTokenAddress(fetchedData?.daoToken);
    }
  }, [fetchedData]);

  ///
  const props: FundDetailsProps = {
    icon: CURRENT_DAO_IMAGE, // Placeholder image URL
    shortname: 'CARTEL',
    longname: '',
    description:
      'Sorcerer is an investment DAO on Monad, that strategically fund AI agents and AI-driven projects, empowering the next wave of decentralized intelligence and autonomous ecosystems.',
    holdings: 0,
    modeAddress: '0x5edbe707191Ae3A5bd5FEa5EDa0586f7488bD961',
  };

  useEffect(() => {
    const fetchTokensWithPrices = async () => {
      try {
        // Fetch token balances
        const response = await axios.get<ApiResponse>(
          '/api/conduit/v2/addresses/0x6F5961A01a4E6c5C2f77399E3758b124219d7A78/token-balances',
        );

        // Fetch prices in parallel

        const pricePromises = response.data.map(async (tokenBalance) => {
          try {
            let priceUsd = '0';
            if (tokenBalance.token.address.toLowerCase() === '0x6bb4a37643e7613e812a8d1af5e675cc735ea1e2') {
              const gambleTokenPrice = await fetchTokenPriceDexScreener('0x6bb4a37643e7613e812a8d1af5e675cc735ea1e2');
              priceUsd = Number(gambleTokenPrice).toFixed(6);
              console.log(priceUsd, 'gambletokenPrice');
            } else {
              const dexResponse = await axios.get<DexScreenerResponse>(
                `/api/dexscreener/token-pairs/v1/mode/${tokenBalance.token.address}`,
              );
              priceUsd = Number((dexResponse.data as unknown as any[])[0]?.priceUsd || 0).toFixed(6);
            }
            return {
              address: tokenBalance.token.address,
              priceUsd: priceUsd,
            };
          } catch (error) {
            console.log(`Failed to fetch price for ${tokenBalance.token.address}`);
            return {
              address: tokenBalance.token.address,
              priceUsd: undefined,
            };
          }
        });

        const prices = await Promise.all(pricePromises);

        // Combine token data with prices
        const tokensWithPrices: EnhancedApiResponse = response.data.map((tokenBalance) => {
          const priceData = prices.find((p) => p.address === tokenBalance.token.address);
          return {
            ...tokenBalance,
            priceUsd: priceData?.priceUsd,
          };
        });

        // Sort tokens by value * price (market value)
        const sortedTokens = tokensWithPrices.sort((a, b) => {
          const aValue = a.priceUsd ? Number(a.value) * Number(a.priceUsd) : Number(a.value);
          const bValue = b.priceUsd ? Number(b.value) * Number(b.priceUsd) : Number(b.value);
          return bValue - aValue;
        });

        setDaoHoldingTokens(sortedTokens);
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
    };

    fetchTokensWithPrices();
  }, []);

  const assetsData: Asset[] = [
    {
      token: 'CARTEL',
      // tokenIcon: CURRENT_DAO_IMAGE,
      balance: Number(daoBalance),
      price: priceUsd,
      totalValue: priceUsd * Number(daoBalance),
    },
  ];

  const [activeTab, setActiveTab] = useState('trades');

  return (
    <PageLayout title="App" description="main-app" app={true}>
      <div className={`overflow-hidden gap-20 flex flex-col justify-center items-center pt-16 px-2`}>
        <div className="grid gap-2 md:gap-3 lg:grid-cols-[55%_45%] w-full">
          <div className="p-2 sm:p-4 flex items-center justify-center">
            <FundDetails {...props} />
          </div>
          <div className="p-2 sm:p-4 flex items-center justify-center">
            <BuySellCard />
          </div>
        </div>
        {/* ///comment */}
      </div>
    </PageLayout>
  );
};

export default Dashboard;

// <div className="w-full flex justify-center lg:justify-start items-center lg:items-start px-8 border-2 border-gray-30 pt-8 rounded-md">
// <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'trades' | 'assets')} className="w-full">
//   <div className="relative w-fit">
//     <TabsList className="h-12 flex items-center gap-6 mb-6 bg-[#1b1c1d] p-1 rounded-md relative">
//       {/* Background Animation - Fixing alignment */}
//       <motion.div
//         layoutId="tabBackground"
//         className="absolute top-0 bottom-0 left-0 bg-teal-50 rounded-md"
//         style={{ width: 'calc(100% / 2)' }} // Fix width dynamically
//         initial={false}
//         animate={{
//           x: activeTab === 'trades' ? '0%' : '100%',
//         }}
//         transition={{ type: 'tween', duration: 0.3 }}
//       />

//       {/* Trades Tab */}
//       <TabsTrigger
//         value="trades"
//         className={`relative px-4 py-1 rounded-md text-sm font-rubik tracking-tight transition-all
//     z-10 ${activeTab === 'trades' ? 'text-black font-semibold' : 'text-gray-400'}`}
//       >
//         Trades
//       </TabsTrigger>

//       {/* Assets Tab */}
//       <TabsTrigger
//         value="assets"
//         className={`relative px-4 py-1 rounded-md text-sm font-rubik tracking-tight transition-all
//     z-10 ${activeTab === 'assets' ? 'text-black font-semibold' : 'text-gray-400'}`}
//       >
//         Assets
//       </TabsTrigger>
//     </TabsList>
//   </div>
//   <TabsContent value="trades" className="w-full">
//     <div className="w-full grid grid-cols-1 md:grid-cols-10 gap-4">
//       {/* Left Section - 70% */}
//       <div className="md:col-span-7">
//         {!daoTokenAddress ? (
//           <div className="flex items-center justify-center h-[400px] sm:h-[600px]">
//             <p className="text-white text-lg">Loading...</p>
//           </div>
//         ) : (
//           <iframe
//             className="h-[400px] w-full border-0 sm:h-[600px]"
//             src={`https://dexscreener.com/mode/${daoTokenAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=0&chartType=usd&interval=15`}
//           ></iframe>
//         )}
//       </div>

//       {/* Right Section - 30% */}
//       <div className="md:col-span-3">
//         <Orderbook
//           name={props.longname}
//           created="7/02/2025"
//           owner="0xb51eC6F7D3E0D0FEae495eFe1f0751dE66b6be95"
//           token={daoTokenAddress}
//           ethRaised="1,000,000 MODE"
//         />
//       </div>
//     </div>
//   </TabsContent>

//   <TabsContent value="assets" className="w-full">
//     <div className="p-2 flex flex-col justify-center items-center">
//       <div className="w-full flex justify-between items-center py-4">
//         <span className="font-semibold text-midGreen font-sora text-xl">Token Balances</span>
//       </div>
//       {/* <AssetTable columns={assetColumns} data={assetsData} /> */}
//       {daaoHoldingTokens ? (
//         <AssetTable columns={assetColumns} data={formatDaoHoldingTokens(daaoHoldingTokens)} />
//       ) : (
//         <div className="flex items-center justify-center h-[400px] sm:h-[600px]">
//           <p className="text-white text-lg">No token balances available.</p>
//         </div>
//       )}
//     </div>
//   </TabsContent>
// </Tabs>
// </div>
