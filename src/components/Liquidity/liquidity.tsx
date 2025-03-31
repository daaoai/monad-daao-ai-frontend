'use client';
import React, { useState, useEffect } from 'react';

import ModeTokenLogo from '/public/assets/mode.png';
import { FlipHorizontalIcon } from 'lucide-react';
import Image from 'next/image';
import { ethers } from 'ethers';
import { CURRENT_DAO_IMAGE } from '@/constants/links';
import {
  daoAddress,
  wmonTokenAddress,
  veloFactoryAddress,
  nonFungiblePositionManagerAddress,
  quoterAddress,
} from '@/constants/addresses';
import bn from 'bignumber.js';
import { Token, Price } from '@uniswap/sdk-core';
import { tickToPrice, nearestUsableTick, priceToClosestTick } from '@uniswap/v3-sdk';
import JSBI from 'jsbi';
import { toast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';
import { ERC_20_ABI } from '@/daao-sdk/abi/erc20';
import { VELO_POOL_ABI } from '@/daao-sdk/abi/veloPool';
import { UNI_FACTORY_ABI } from '@/daao-sdk/abi/uniFactory';
import { NON_FUNGIBLE_POSITION_MANAGER_ABI } from '@/daao-sdk/abi/nonFungiblePositionManager';
import { QUOTER_ABI } from '@/daao-sdk/abi/quoterAbi';
import { DAO } from '@/daao-sdk/abi/dao';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shadcn/components/ui/dialog';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { monadChainId, tickSpacing } from '@/constants/modeChain';
import Link from 'next/link';

bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

interface LiquidityProps {
  onClose: () => void;
}

const Liquidity: React.FC<LiquidityProps> = ({ onClose }) => {
  const MODE_TOKEN_ADDRESS = wmonTokenAddress;
  const TICK_SPACING = tickSpacing;
  const DAO_TOKEN_ADDRESS = daoAddress || process.env.NEXT_PUBLIC_DAO_ADDRESS;
  const VELO_FACTORY_ADDRESS = veloFactoryAddress || process.env.NEXT_PUBLIC_VELO_FACTORY_ADDRESS;
  const NON_FUNGIBLE_POSITION_MANAGER_ADDRESS =
    nonFungiblePositionManagerAddress || process.env.NEXT_PUBLIC_NON_FUNGIBLE_POSITION_MANAGER_ADDRESS;
  const QUOTER_ADDRESS = quoterAddress || process.env.NEXT_PUBLIC_QUOTER_ADDRESS;

  const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
  const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));
  const RPC_URL = 'https://testnet-rpc.monad.xyz';
  const MODE_NETWORK_CHAIN_ID = Number(monadChainId);

  const { isConnected, address } = useAccount();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [token0Amount, setToken0Amount] = useState('');
  const [token1Amount, setToken1Amount] = useState('');
  const [token0, setToken0] = useState('CARTEL');
  const [token1, setToken1] = useState('MODE');
  const [selectedRange, setSelectedRange] = useState('25');
  const [customRange, setCustomRange] = useState('');
  const [daoToken, setDaoToken] = useState<{
    address: string;
    symbol: string;
    name: string;
  } | null>(null);
  const [token0Address, setToken0Address] = useState('');
  const [token0Decimals, setToken0Decimals] = useState(18);
  const [poolAddress, setPoolAddress] = useState<string>('');
  const [slippageTolerance, setSlippageTolerance] = useState('1');
  const [customSlippage, setCustomSlippage] = useState('');
  const [isSlippageSettingsOpen, setIsSlippageSettingsOpen] = useState(false);
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(false);

  const [pricedata, setPricedata] = useState<any>(null);
  const [currentTokenSwapAmount, setCurrentTokenSwapAmount] = useState<any>(0);
  const [direction, setDirection] = useState('from');
  const [priceRange, setPriceRange] = useState<{
    lowerTick: number;
    upperTick: number;
    lowerPrice: number;
    upperPrice: number;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [initalRendering, setInitalRendering] = useState(true);

  const fetchDecimals = async (tokenAddress: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tokenContract = new ethers.Contract(tokenAddress, ERC_20_ABI, provider);
    return tokenContract.decimals();
  };

  const fetchDAOTokenInfo = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const daoContract = new ethers.Contract(DAO_TOKEN_ADDRESS!, DAO, provider);

    const [address, symbol, name] = await Promise.all([
      daoContract.daoToken(),
      daoContract.symbol(),
      daoContract.name(),
    ]);

    return { address, symbol, name };
  };

  // *Getting Quote

  const fetchCurrentPrice = async () => {
    try {
      // Add validation for pool address
      if (!poolAddress || !ethers.utils.isAddress(poolAddress)) {
        throw new Error('Invalid pool address');
      }

      // Specify chainId in provider config
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL, {
        chainId: MODE_NETWORK_CHAIN_ID,
        name: 'Mode Network',
      });

      const poolContractInstance = new ethers.Contract(poolAddress, VELO_POOL_ABI, provider);

      const { tick, sqrtPriceX96 } = await poolContractInstance.slot0();
      const tickSpacing = await poolContractInstance.tickSpacing();

      const token0 = await poolContractInstance.token0();
      const token1 = await poolContractInstance.token1();

      const token0Instance = new ethers.Contract(token0, ERC_20_ABI, provider);
      const token1Instance = new ethers.Contract(token1, ERC_20_ABI, provider);

      const token0Decimals = await token0Instance.decimals();
      const token1Decimals = await token1Instance.decimals();

      const token0Symbol = await token0Instance.symbol();
      const token1Symbol = await token1Instance.symbol();

      const baseToken = new Token(MODE_NETWORK_CHAIN_ID as number, token0, token0Decimals, token0Symbol, 'token0Name');
      const quoteToken = new Token(MODE_NETWORK_CHAIN_ID as number, token1, token1Decimals, token1Symbol, 'token1Name');

      let currentPrice = 0;

      if (baseToken && quoteToken) {
        currentPrice = Number(tickToPrice(baseToken, quoteToken, Number(tick)).toSignificant(6));
        const sqrtRatioX96 = JSBI.BigInt(sqrtPriceX96);
        currentPrice = Number(
          new Price(quoteToken, baseToken, Q192, JSBI.multiply(sqrtRatioX96, sqrtRatioX96)).toSignificant(6),
        );
      }

      return {
        token0,
        token1,
        token0Symbol,
        token1Symbol,
        currentPrice,
        tick,
        tickSpacing,
        sqrtPriceX96,
        token0Decimals,
        token1Decimals,
      };
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error; // Re-throw to handle in calling code
    }
  };

  const calculatePriceRangeInTick = async (percentageDifference: any, currentPriceData: any) => {
    try {
      // const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

      const { token0, token1, token0Decimals, token1Decimals, token0Symbol, token1Symbol, currentPrice, tickSpacing } =
        currentPriceData;
      const lowerPrice = new bn(currentPrice).multipliedBy(1 - percentageDifference).toNumber();
      const upperPrice = new bn(currentPrice).multipliedBy(1 + percentageDifference).toNumber();

      const baseToken = new Token(MODE_NETWORK_CHAIN_ID, token0, token0Decimals, token0Symbol, 'token0Name');
      const quoteToken = new Token(MODE_NETWORK_CHAIN_ID, token1, token1Decimals, token1Symbol, 'token1Name');

      // Convert prices using proper fraction handling
      const lowerPriceFraction = new Price(
        baseToken,
        quoteToken,
        JSBI.BigInt(10 ** 18), // denominator
        JSBI.BigInt(Math.floor(lowerPrice * 10 ** 18)), // numerator
      );

      const upperPriceFraction = new Price(
        baseToken,
        quoteToken,
        JSBI.BigInt(10 ** 18), // denominator
        JSBI.BigInt(Math.floor(upperPrice * 10 ** 18)), // numerator
      );

      let lowerTick = priceToClosestTick(lowerPriceFraction as any);
      let upperTick = priceToClosestTick(upperPriceFraction as any);

      lowerTick = nearestUsableTick(lowerTick, tickSpacing);
      upperTick = nearestUsableTick(upperTick, tickSpacing);

      return { lowerTick, upperTick, lowerPrice, upperPrice };
    } catch (error) {
      console.log(error, 'calculatePriceRangeInTick');
    }
  };

  const calculateEstimatedAmount0 = async (givenAmount1: any, currentPriceData: any, priceRangeData: any) => {
    // Add validation at start of function
    if (!priceRangeData?.lowerTick || !priceRangeData?.upperTick) {
      throw new Error('Invalid price range data');
    }

    const jsonProvider = new ethers.providers.JsonRpcProvider(RPC_URL, {
      chainId: MODE_NETWORK_CHAIN_ID,
      name: 'Mode Network',
    });

    const quoterContractInstance = new ethers.Contract(QUOTER_ADDRESS as string, QUOTER_ABI, jsonProvider);

    const { token0Decimals, token1Decimals, sqrtPriceX96 } = currentPriceData;

    let amount0 = await quoterContractInstance.estimateAmount0(
      givenAmount1,
      poolAddress,
      sqrtPriceX96,
      priceRangeData.lowerTick, // Now safe to access
      priceRangeData.upperTick, // Now safe to access
    );

    amount0 = ethers.utils.formatUnits(amount0.toString(), token0Decimals);
    const amount1 = ethers.utils.formatUnits(givenAmount1, token1Decimals);

    return { amount0, amount1 };
  };

  const calculateEstimatedAmount1 = async (
    givenAmount0: any,
    currentPriceData: any,
    priceRangeData: any,
    // provider: ethers.providers.Provider
  ) => {
    const jsonProvider = new ethers.providers.JsonRpcProvider(RPC_URL, {
      chainId: MODE_NETWORK_CHAIN_ID,
      name: 'Mode Network',
    });

    // Use jsonProvider instead of provider
    const quoterContractInstance = new ethers.Contract(QUOTER_ADDRESS as string, QUOTER_ABI, jsonProvider);
    const { token0Decimals, token1Decimals, sqrtPriceX96 } = currentPriceData;

    let amount1 = (
      await quoterContractInstance.estimateAmount1(
        givenAmount0,
        poolAddress,
        sqrtPriceX96,
        priceRangeData?.lowerTick,
        priceRangeData?.upperTick,
      )
    ).toString();

    amount1 = ethers.utils.formatUnits(amount1, token1Decimals);
    const amount0 = ethers.utils.formatUnits(givenAmount0, token0Decimals);

    return { amount0, amount1 };
  };

  const handleToken0AmountChange = async (e: any) => {
    try {
      setToken0Amount(e);
      if (!e || !pricedata) return;

      const amount = e * 10 ** pricedata.token0Decimals;
      const priceRange = await calculatePriceRangeInTick(Number(selectedRange) / 100, pricedata);

      if (!priceRange?.lowerTick || !priceRange?.upperTick) {
        throw new Error('Invalid price range calculation');
      }

      setPriceRange(priceRange);
      const calculatedAmount = await calculateEstimatedAmount1(String(amount), pricedata, priceRange);
      setToken1Amount(calculatedAmount?.amount1 || '');
    } catch (error) {
      console.log(error, 'error');
      setToken1Amount('');
      setError('Invalid price range - try a smaller range percentage');
    }
  };

  const handleToken1AmountChange = async (e: any) => {
    setToken0Amount(e);
    const amount = e * 10 ** pricedata?.token0Decimals;
    const priceRange = await calculatePriceRangeInTick(Number(selectedRange) / 100, pricedata);
    setPriceRange(priceRange ?? null);

    const calculatedAmount = await calculateEstimatedAmount0(String(amount), pricedata, priceRange);
    setToken1Amount(calculatedAmount?.amount0);
  };

  const handleInputChange = async (e: any) => {
    if (direction === 'from') {
      handleToken0AmountChange(e);
    } else {
      handleToken1AmountChange(e);
    }
  };

  useEffect(() => {
    if (direction === 'from') {
      if (token0Amount) {
        handleToken0AmountChange(token0Amount);
      }
    } else {
      if (token0Amount) {
        handleToken1AmountChange(token0Amount);
      }
    }
  }, [selectedRange]);

  useEffect(() => {
    const getPriceData = async () => {
      const priceData = await fetchCurrentPrice();
      console.log('================================');
      console.log('Price Data:', priceData);
      console.log(`1 ${priceData?.token0Symbol} = ${priceData?.currentPrice} ${priceData?.token1Symbol}`);
      setCurrentTokenSwapAmount(priceData?.currentPrice);
      console.log('================================');
      setPricedata(priceData);
      if (priceData) {
        setInitalRendering(false);
      }

      // let percentageDifference = 0.1 // 10%
      // let percentageDifference = 0.3; // 30%
      // let priceRange = await calculatePriceRangeInTick(percentageDifference, priceData)
      const priceRange = await calculatePriceRangeInTick(Number(selectedRange) / 100, priceData);

      // Add null check before using priceRange
      if (!priceRange?.lowerTick || !priceRange?.upperTick) {
        console.error('Invalid price range calculation');
        return;
      }

      setPriceRange(priceRange);

      // token1= mode
      // token0=cartel

      const amount1In = '1000000000000000000'; // 1 * 10**token1Decimals

      const amounts = await calculateEstimatedAmount0(amount1In, priceData, priceRange);
      console.log('Amount1Given, amounts:', amounts);

      const amount0In = '1000000000000000000';
      // const jsonProvider = new ethers.providers.JsonRpcProvider(RPC_URL, {
      //     chainId: MODE_NETWORK_CHAIN_ID,
      //     name: 'Mode Network'
      // });
      const amounts1 = await calculateEstimatedAmount1(
        amount0In,
        priceData,
        priceRange,
        // jsonProvider
      );
      console.log('Amount0 Given, amounts:', amounts1);
    };
    if (poolAddress) {
      getPriceData();
    }
  }, [poolAddress]);

  // *getting quote end

  // *Add Liquidity Start

  const handleAddLiquidity = async () => {
    try {
      if (!isConnected || !address) {
        toast({
          title: 'Please connect your wallet first',
          description: "It looks like your wallet isn't connected",
          variant: 'destructive',
        });
        return;
      }
      setIsLoading(true); // Start loading
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const recipient = await signer.getAddress();

      // Convert amounts to Wei with proper decimals
      const amount0Desired = ethers.utils.parseUnits(token0Amount, pricedata.token0Decimals);
      const amount1Desired = ethers.utils.parseUnits(token1Amount, pricedata.token1Decimals);

      // Add token approvals
      const token0Contract = new ethers.Contract(pricedata.token0, ERC_20_ABI, signer);
      const token1Contract = new ethers.Contract(pricedata.token1, ERC_20_ABI, signer);

      // Check existing allowances
      const currentAllowance0 = await token0Contract.allowance(recipient, NON_FUNGIBLE_POSITION_MANAGER_ADDRESS);
      const currentAllowance1 = await token1Contract.allowance(recipient, NON_FUNGIBLE_POSITION_MANAGER_ADDRESS);

      // Approve token0 only if needed
      if (currentAllowance0.lt(amount0Desired)) {
        setApprovalStatus(`Approving ${token0}...`);
        const approve0Tx = await token0Contract.approve(
          NON_FUNGIBLE_POSITION_MANAGER_ADDRESS,
          amount0Desired.toString(),
        );
        await approve0Tx.wait();
        setApprovalStatus(null);
      }

      // Approve token1 only if needed
      if (currentAllowance1.lt(amount1Desired)) {
        setApprovalStatus(`Approving ${token1}...`);
        const approve1Tx = await token1Contract.approve(
          NON_FUNGIBLE_POSITION_MANAGER_ADDRESS,
          amount1Desired.toString(),
        );
        await approve1Tx.wait();
        setApprovalStatus(null);
      }

      // Get current block timestamp and add 20 minutes for deadline
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      // Calculate minimum amounts with slippage tolerance
      const effectiveSlippage = customSlippage || slippageTolerance;
      const amount0Min = amount0Desired.mul(10000 - Number(effectiveSlippage) * 100).div(10000);
      const amount1Min = amount1Desired.mul(10000 - Number(effectiveSlippage) * 100).div(10000);

      // Get price range data
      const priceRangeData = await calculatePriceRangeInTick(Number(selectedRange) / 100, pricedata);

      if (!priceRangeData?.lowerTick || !priceRangeData?.upperTick) {
        throw new Error('Price range data not loaded');
      }

      if (!poolAddress) {
        throw new Error('Pool does not exist for this token pair');
      }

      // Verify token approvals
      const allowance0 = await token0Contract.allowance(recipient, NON_FUNGIBLE_POSITION_MANAGER_ADDRESS);
      const allowance1 = await token1Contract.allowance(recipient, NON_FUNGIBLE_POSITION_MANAGER_ADDRESS);

      if (allowance0.lt(amount0Desired)) {
        throw new Error('Insufficient token0 allowance');
      }

      if (allowance1.lt(amount1Desired)) {
        throw new Error('Insufficient token1 allowance');
      }

      const params = {
        token0: pricedata.token0,
        token1: pricedata.token1,
        tickSpacing: TICK_SPACING.toString(),
        tickLower: priceRangeData.lowerTick.toString(),
        tickUpper: priceRangeData.upperTick.toString(),
        amount0Desired: amount0Desired.toString(),
        amount1Desired: amount1Desired.toString(),
        amount0Min: amount0Min.toString(),
        amount1Min: amount1Min.toString(),
        recipient,
        deadline: deadline.toString(),
        sqrtPriceX96: '0',
      };

      console.log('Params:', params);

      // Add validation for all parameters
      const isValid = Object.values(params).every(
        (v) => v !== undefined && v !== null && v !== 'NaN' && v !== 'undefined',
      );

      if (!isValid) {
        throw new Error('Invalid transaction parameters - check input values');
      }

      const positionManagerContract = new ethers.Contract(
        NON_FUNGIBLE_POSITION_MANAGER_ADDRESS as string,
        NON_FUNGIBLE_POSITION_MANAGER_ABI,
        signer,
      );

      const tx = await positionManagerContract.mint(params);
      const receipt = await tx.wait();
      console.log('Liquidity added successfully:', receipt);
      toast({
        title: 'Liquidity added successfully',
        // variant: "destructive",
        className: `bg-[#2ca585]`,
      });

      // Reset state on success
      setToken0Amount('');
      setToken1Amount('');
      // setIsModalOpen(false);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error adding liquidity:', error);
      if (error.code === 'ACTION_REJECTED' || error.code === '4001') {
        console.log('Transaction rejected by user');
        toast({
          title: 'Transaction Rejected',
          variant: 'destructive',
        });
        setApprovalStatus(null);
      } else {
        setApprovalStatus(null);
        toast({
          title: 'Transaction Failed',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDaoToken = async () => {
      const daoTokenInfo = await fetchDAOTokenInfo();
      if (!daoTokenInfo) return;

      setDaoToken(daoTokenInfo);
      setToken0(daoTokenInfo.symbol);
      setToken0Address(daoTokenInfo.address);
      fetchDecimals(daoTokenInfo.address).then(setToken0Decimals);
    };

    fetchDaoToken();
  }, []);

  useEffect(() => {
    const fetchPoolAddress = async () => {
      if (!token0Address || !MODE_TOKEN_ADDRESS) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const factoryContract = new ethers.Contract(
        VELO_FACTORY_ADDRESS!,
        UNI_FACTORY_ABI,
        // velodromeFactoryABI,
        provider,
      );

      const [tokenA, tokenB] = [token0Address, MODE_TOKEN_ADDRESS].sort();

      try {
        const pool = await factoryContract.getPool(tokenA, tokenB, TICK_SPACING);

        if (pool !== ethers.constants.AddressZero) {
          setPoolAddress(pool);
        } else {
          console.log('Pool does not exist yet');
          setPoolAddress('');
        }
      } catch (error) {
        console.error('Error fetching pool:', error);
      }
    };

    fetchPoolAddress();
  }, [token0Address, MODE_TOKEN_ADDRESS]);

  const handleSwap = () => {
    // Swap tokens and their amounts
    //     const tempToken = token0;
    //     const tempAmount = token0Amount;

    //     setToken0(token1);
    //     setToken1(tempToken);
    //     setToken0Amount(token1Amount);
    //     setToken1Amount(tempAmount);

    if (direction === 'from') {
      setToken0(token1);
      setToken1(token0);
      // setToken0Amount(token1Amount);
      // setToken1Amount(token0Amount);
      setToken0Amount('');
      setToken1Amount('');
      setDirection('to');
    } else {
      const currentConversion = 1 / (pricedata && pricedata?.currentPrice);

      setToken1(token0);
      setToken0(token1);
      // setToken1Amount(token0Amount);
      // setToken0Amount(token1Amount);
      setToken0Amount('');
      setToken1Amount('');
      setDirection('from');
      setCurrentTokenSwapAmount(currentConversion);
    }
  };

  useEffect(() => {
    if (pricedata) {
      if (direction === 'from') {
        const currentConversion = pricedata && pricedata?.currentPrice;
        setCurrentTokenSwapAmount(currentConversion);
      } else {
        const currentConversion = 1 / (pricedata && pricedata?.currentPrice);
        setCurrentTokenSwapAmount(currentConversion);
      }
    }
  }, [direction, pricedata]);

  // Add this useEffect to recalculate when price range updates
  useEffect(() => {
    const recalculateAmounts = async () => {
      if (!token0Amount || !pricedata || !priceRange) return;

      try {
        if (direction === 'from') {
          const amount = Number(token0Amount) * 10 ** pricedata.token0Decimals;
          const calculated = await calculateEstimatedAmount1(String(amount), pricedata, priceRange);
          setToken1Amount(calculated?.amount1 || '');
        } else {
          const amount = Number(token0Amount) * 10 ** pricedata.token1Decimals;
          const calculated = await calculateEstimatedAmount0(String(amount), pricedata, priceRange);
          setToken1Amount(calculated?.amount0 || '');
        }
      } catch (error) {
        setToken1Amount('');
        console.error('Recalculation error:', error);
      }
    };

    recalculateAmounts();
  }, [priceRange]);

  return (
    <div className="liquidity_main-container max-h-[80vh] sm:max-h-none overflow-y-auto z-50">
      <div className="flex flex-col md:flex-row gap-6 bg-gray-40 p-8 items-center justify-center rounded-lg">
        <div className="flex flex-col gap-6 items-start">
          <Image src="/assets/testing.svg" alt="defai-cartel" width={400} height={400} />
          <div className="flex flex-col items-start gap-4">
            <p className="text-2xl font-sora font-medium text-white">DeFAI Cartel</p>
            <Link
              href="https://velodrome.finance/swap?from=0xdfc7c877a950e49d2610114102175a06c2e3167a&to=0x98e0ad23382184338ddcec0e13685358ef845f30&chain0=34443&chain1=34443"
              className="text-teal-60 font-normal"
            >
              Trade On Velodrome
            </Link>
          </div>
        </div>
        <div className="bg-black border-[#27292a] border-2 rounded-md text-white top-40 p-4">
          <div>
            <p>Add Liquidity</p>
          </div>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              {/* Token 0 Input */}
              <div className="bg-gray-40 px-4 py-2 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer">
                    <Image
                      src={daoToken?.symbol === token0 ? CURRENT_DAO_IMAGE : ModeTokenLogo}
                      alt="Token logo"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium">{token0}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder="0.0"
                    className="text-right text-2xl bg-transparent border-0 focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={token0Amount}
                    onChange={(e) => handleInputChange(e.target.value)}
                    // onChange={(e) => handleToken0Change(e.target.value)}
                    min="0"
                    step="any"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center -my-4 z-10">
                <Button
                  size="icon"
                  className="rounded-full bg-gray-40 hover:bg-gray-700 border-4 border-[#0d0d0d]"
                  onClick={handleSwap}
                >
                  <FlipHorizontalIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Token 1 Input */}
              <div className="bg-gray-40 px-4 py-2 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer">
                    <Image
                      src={daoToken?.symbol === token1 ? CURRENT_DAO_IMAGE : ModeTokenLogo}
                      alt="Token logo"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="font-medium">{token1}</span>
                  </div>
                  <Input
                    type="number"
                    placeholder={initalRendering && token0Amount ? 'Calculating...' : '0.0'}
                    disabled={true}
                    className="text-right text-2xl bg-transparent border-0 focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={token1Amount}
                    // onChange={(e) => setToken1Amount(e.target.value)}
                    // onChange={(e) => handleToken1Change(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pool Info */}
            <div className="bg-gray-40 px-4 py-2 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exchange Rate</span>
                <span>
                  1 {token0} = {Number(currentTokenSwapAmount).toFixed(6) || 0} {token1}
                </span>
              </div>
            </div>

            {/* Price Range Selection */}
            <div className="bg-gray-40 px-4 py-2 rounded-xl space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsPriceRangeOpen(!isPriceRangeOpen)}
              >
                <h3 className="text-sm font-medium">Select Price Range</h3>
                <svg
                  className={`w-5 h-5 transition-transform ${isPriceRangeOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${isPriceRangeOpen ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-3 gap-2">
                    {['25', '50', '99'].map((range) => (
                      <Button
                        key={range}
                        variant={selectedRange === range ? 'default' : 'outline'}
                        className={`text-sm ${
                          selectedRange === range
                            ? 'bg-white text-black hover:bg-gray-100'
                            : 'bg-gray-40 text-gray-300 hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          setSelectedRange(range);
                          setCustomRange('');
                        }}
                      >
                        ±{range}%
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Custom"
                      className="flex-1 bg-gray-40 border-0 focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={customRange}
                      onChange={(e) => {
                        setCustomRange(e.target.value);
                        setSelectedRange(e.target.value);
                      }}
                    />
                    <span className="text-gray-400 text-sm">%</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {selectedRange
                      ? `Your liquidity will be concentrated between ±${selectedRange}%`
                      : customRange
                        ? `Custom range set to ±${customRange}%`
                        : 'Select a price range'}
                  </p>
                  {priceRange && (
                    <p className="text-sm text-gray-400 mt-2">
                      Price range: {priceRange.lowerPrice.toFixed(6)} to {priceRange.upperPrice.toFixed(6)} {token1} per{' '}
                      {token0}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Slippage Tolerance */}
            <div className="space-y-4">
              {/* Settings Trigger */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsSlippageSettingsOpen(!isSlippageSettingsOpen)}
              >
                <span className="text-sm">Slippage Tolerance</span>
                <svg
                  className={`w-5 h-5 transition-transform ${isSlippageSettingsOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              {/* Collapsible Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isSlippageSettingsOpen ? 'max-h-40' : 'max-h-0'
                }`}
              >
                <div className="bg-gray-40 px-4 py-2 rounded-xl space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['0.1', '0.5', '1'].map((slippage) => (
                      <Button
                        key={slippage}
                        variant={slippageTolerance === slippage ? 'default' : 'outline'}
                        className={`text-sm ${
                          slippageTolerance === slippage
                            ? 'bg-white text-black hover:bg-gray-100'
                            : 'bg-gray-40 text-gray-300 hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          setSlippageTolerance(slippage);
                          setCustomSlippage('');
                        }}
                      >
                        {slippage}%
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Custom"
                      className="flex-1 bg-gray-40 border-0 focus-visible:ring-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={customSlippage}
                      onChange={(e) => {
                        setCustomSlippage(e.target.value);
                        setSlippageTolerance('');
                      }}
                    />
                    <span className="text-gray-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Liquidity Button */}
            <Button
              className="w-full py-2 text-lg bg-teal-50 text-black hover:bg-gray-100 rounded-xl"
              onClick={handleAddLiquidity}
              disabled={
                isLoading ||
                !!approvalStatus ||
                !token0Amount ||
                !token1Amount ||
                parseFloat(token0Amount) <= 0 ||
                parseFloat(token1Amount) <= 0 ||
                !priceRange
              }
            >
              {approvalStatus || (isLoading ? 'Processing...' : 'Add Liquidity')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Liquidity;
