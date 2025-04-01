import Image from 'next/image';
import React, { useState, useEffect, useCallback } from 'react';
import { useFundContext } from './FundContext';
import Liquidity from '../Liquidity/liquidity';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { Card } from '@/shadcn/components/ui/card';
import { shortenAddress } from '@/utils/address';
import type { FundDetailsProps } from '@/types';
import { daoAddress } from '@/constants/addresses';
import ClickToCopy from '../copyToClipboard';
import { telegramDeFAILink, telegramLink, twitterDeFAILink, twitterLink } from '@/constants/links';
import PoolDetailCard from '../poolDetailCard';
import { ModalWrapper } from '../modalWrapper';
import LPFarms from '../lpFarms';

const FundDetails: React.FC<FundDetailsProps> = (props) => {
  interface TokenChangeState {
    percent: number;
    token: number;
  }
  const { daoBalance } = useFundContext();
  const [marketCap, setMarketCap] = useState<number | null>(null);
  const [liquidity, setLiquidity] = useState<number | null>(null);
  const [volume, setVolume] = useState<number | null>(null);
  const [daoTokenAddress, setDaoTokenAddress] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const { setPriceUsd } = useFundContext();
  const [tokenChange, setTokenChange] = useState<TokenChangeState>({
    percent: 0,
    token: 0,
  });
  const [isLiquidityModalOpen, setIsLiquidityModalOpen] = useState(false);
  const openLiquidityModalOpen = useCallback(() => setIsLiquidityModalOpen(true), []);
  const closeLiquidityModalOpen = useCallback(() => setIsLiquidityModalOpen(false), []);
  const [isLPFarmModalOpen, setIsLPFarmModalOpen] = useState(false);
  const openFarmModalOpen = useCallback(() => setIsLPFarmModalOpen(true), []);
  const closeFarmModalOpen = useCallback(() => setIsLPFarmModalOpen(false), []);

  // useEffect(() => {
  //   const fetchContractData = async () => {
  //     try {
  //       const data = await getContractData()
  //       if (data?.daoToken) {
  //         setDaoTokenAddress(data.daoToken)
  //       }
  //     } catch (error) {
  //       console.error('Error fetching contract data:', error)
  //     }
  //   }
  //   fetchContractData()
  // }, [isConnected])

  // useEffect(() => {
  //   const fetchDaoBalance = async () => {
  //     if (!daoTokenAddress) return
  //     if (typeof window === 'undefined' || !(window as any).ethereum) return

  //     try {
  //       await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
  //       const provider = new ethers.providers.Web3Provider((window as any).ethereum)
  //       const signer = provider.getSigner()
  //       const userAddress = await signer.getAddress()

  //       const daoContract = new ethers.Contract(daoTokenAddress, daoABI, provider)
  //       const balanceBN = await daoContract.balanceOf(userAddress)
  //       const balanceFormatted = ethers.utils.formatUnits(balanceBN, 18)
  //       console.log("Balance is pikcachuuuuuu ", daoBalance)
  //       setDaoHoldings(daoBalance)
  //     } catch (error) {
  //       console.error('Error fetching DAO balance:', error)
  //     }
  //   }
  //   fetchDaoBalance()
  // }, [daoTokenAddress])

  const calculateTokenChange = (marketCap: number, percentageChange: number): number => {
    return (marketCap * percentageChange) / 100;
  };

  useEffect(() => {
    const modeRpc = 'https://testnet-rpc.monad.xyz';
    const fetchMarketData = async () => {
      const provider = new ethers.providers.JsonRpcProvider(modeRpc);

      // const signer = provider.getSigner();

      const contract = new ethers.Contract(daoAddress as string, CONTRACT_ABI, provider);
      const daoToken = await contract.daoToken();
      setDaoTokenAddress(daoToken);
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
          setPriceUsd(data[0].priceUsd);
          // setPriceUsd(23)
          // const marketCap = (Number(data[0].priceUsd) * 10 ** 9).toFixed(0)
          const marketCap = Number(data[0].marketCap).toFixed(0);
          const liq = Number(data[0].liquidity?.usd).toFixed(0);
          const volume = Number(data[0].volume?.h24).toFixed(0);
          setMarketCap(Number(marketCap));
          setLiquidity(Number(liq));
          setVolume(Number(volume));
          const percentageChange = Number(data?.[0]?.priceChange?.h24);
          const tokenChangeValue = calculateTokenChange(Number(marketCap), percentageChange);
          setTokenChange({
            percent: percentageChange,
            token: tokenChangeValue,
          });
        } else {
          console.warn('Market data not in expected format.');
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    fetchMarketData();
    // }, [daoTokenAddress, setPriceUsd])
  }, [setPriceUsd]);

  return (
    <Card className="text-white sm:p-2  w-full border-none">
      <div className="w-full">
        <Image src="/assets/testing.svg" alt="defai-cartel" width={300} height={200} />
      </div>

      {/* <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex-shrink-0 overflow-hidden">
            <Image
              className="w-full h-full object-cover"
              src={props.icon}
              width={70}
              height={70}
              alt={`${props.longname} icon`}
            />
          </div>
          <CardTitle className={`text-xl sm:text-2xl md:text-3xl font-semibold`}>
            ${props.shortname} {props.longname}
          </CardTitle>
        </div> */}
      {/* <div className="border-2 border-gray-30 rounded-md my-4 p-6 flex items-center gap-6">
        <button
          className="bg-teal-50 text-black text-sm rounded-md p-2 hover:bg-teal-60 active:scale-95 transition-transform ease-in-out duration-150"
          onClick={openLiquidityModalOpen}
        >
          Manage
        </button>
        <button
          className="underline text-teal-50 text-sm rounded-md p-2 active:scale-95 transition-transform ease-in-out duration-150"
          onClick={openFarmModalOpen}
        >
          LP Farms
        </button>

        <ModalWrapper isOpen={isLiquidityModalOpen} onClose={closeLiquidityModalOpen} className="!max-w-[56rem]">
          <Liquidity onClose={closeLiquidityModalOpen} />
        </ModalWrapper>
        <ModalWrapper isOpen={isLPFarmModalOpen} onClose={closeFarmModalOpen}>
          <LPFarms onClose={closeFarmModalOpen} daoTokenAddress={daoTokenAddress} />
        </ModalWrapper> */}
      {/* 
          <div className="flex flex-col gap-2">
            <p className="text-gray-70 font-rubik text-sm font-normal">LP VALUE</p>
            <p>12</p>
          </div>
          <div className="text-gray-70 font-rubik text-sm font-normal">
            <p>LP BALANCE</p>
            <p>12</p>
          </div>
          <div className="text-gray-70 font-rubik text-sm font-normal">
            <p>24H VOLUME</p>
            <p>12</p>
          </div>
         */}
      {/* </div> */}
      <div className="flex justify-between w-full mb-4">
        <div className="w-fit flex gap-x-2 items-center">
          <h5 className="text-sm sm:text-base lg:text-lg text-[#D0F0BF]">$Sorcerer</h5>
          <div className="bg-[#053738] p-1 rounded-2xl flex gap-x-2 px-3">
            <p className="text-sm sm:text-base lg:text-lg">{shortenAddress(daoTokenAddress)}</p>
            <ClickToCopy copyText={daoTokenAddress} className="text-teal-20" />
          </div>
        </div>
        <div className="w-fit flex items-center gap-x-2">
          <a>
            <Image
              src="/assets/link-logo.svg"
              alt="defai-cartel"
              className="w-4 h-4 sm:w-5 sm:h-5"
              width={24}
              height={24}
              style={{ width: '100%' }}
            />
          </a>
          <a href={telegramDeFAILink} target="_blank" rel="noopener noreferrer">
            <Image
              src="/assets/telegram-icon.svg"
              alt="defai-cartel"
              className="w-4 h-4 sm:w-5 sm:h-5"
              width={24}
              height={24}
              style={{ width: '100%' }}
            />
          </a>
          <a href={twitterDeFAILink} target="_blank" rel="noopener noreferrer">
            <Image
              src="/assets/x.svg"
              alt="defai-cartel"
              className="w-4 h-4 sm:w-5 sm:h-5"
              width={24}
              height={24}
              style={{ width: '100%' }}
            />
          </a>
        </div>
      </div>
      <div className="flex w-full flex-col items-start gap-y-3 pb-6">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold">Sorcerer</h2>
        <p className=" sm:text-xs lg:text-sm text-left text-[#AEB3B6]">
          Sorcerer is an investment DAO on Monad, that strategically fund AI agents and AI-driven projects, empowering
          the next wave of decentralized intelligence and autonomous ecosystems.
        </p>
      </div>
      <div className="w-full">
        <PoolDetailCard marketCap={marketCap || 0} liquidity={liquidity || 0} volume={volume || 0} />
      </div>

      {/* 
      <CardContent className="space-y-4 sm:space-y-6">
        <Card className="bg-[#1b1c1d] border-[#27292a] w-full">
          <CardContent className="pt-6">
            <p className=" text-sm sm:text-base md:text-lg lg:text-lg text-left">{props?.description}</p>
          </CardContent>
        </Card>

        <div className="text-left flex flex-row gap-4 sm:gap-6">
          <div className="grid grid-rows-[80%_20%] gap-2 sm:gap-1 w-full">
            <Card className="bg-[#1b1c1d] border-[#27292a] p-2 sm:p-4 w-full h-[max-content]">
              <CardContent className="space-y-1 sm:space-y-2 px-2 sm:px-3 pb-0">
                <p className="text-[#aeb3b6] text-sm sm:text-base md:text-lg lg:text-xl">Market Cap</p>
                <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold">
                  ${commaSeparator(marketCap || 0)}
                </p>
                <p
                  className={`text-lg sm:text-lg md:text-xl lg:text-2xl font-semibold ${
                    tokenChange?.percent < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {`${commaSeparator(Number(tokenChange?.token || 0).toFixed(2))} (${Number(
                    tokenChange?.percent || 0,
                  ).toFixed(2)}%)`}
                </p>
              </CardContent>
            </Card>
            <div className="h-min flex justify-center items-center gap-2 text-[#498ff8] text-sm sm:text-base md:text-xl mt-2">
              <span>{shortenAddress(daoTokenAddress)}</span>
              <Copy
                className="w-4 h-4 sm:w-5 sm:h-5 hover:cursor-pointer"
                onClick={() => handleCopy(props.modeAddress)}
              />
            </div>
          </div>

          <Card className="bg-[#1b1c1d] border-[#27292a] p-2 sm:p-4 w-full">
            <CardContent className="space-y-2 sm:space-y-4 px-2 sm:px-3 p-0">
              <div>
                <p className="text-[#aeb3b6] text-sm sm:text-base md:text-lg lg:text-xl">Your Holdings</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
                  {Number(daoBalance).toFixed(2)} {props.shortname}{' '}
                  <span className="text-sm sm:text-lg md:text-xl lg:text-2xl"></span>
                </p>
              </div>
              <div>
                <p className="text-[#aeb3b6] text-sm sm:text-base md:text-lg lg:text-xl">Your Market Value</p>
                <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-semibold">
                  ${(Number(daoBalance) * Number(price)).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent> */}
    </Card>
  );
};

export default FundDetails;
