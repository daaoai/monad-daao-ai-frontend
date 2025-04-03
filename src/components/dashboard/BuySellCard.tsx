'use client';
import { quoterAddress, swapRouterAddress, veloFactoryAddress, wmonTokenAddress } from '@/constants/addresses';
import { CURRENT_DAO_IMAGE } from '@/constants/links';
import { tickSpacing } from '@/constants/modeChain';
import { DAO_TOKEN_ABI } from '@/daao-sdk/abi/daoToken';
import { TOKEN_ABI } from '@/daao-sdk/abi/mode';
import { ROUTER_ABI } from '@/daao-sdk/abi/router';
import { SWAP_ROUTER_SIMULATE } from '@/daao-sdk/abi/swapRouterSimulate';
import { UNI_FACTORY_ABI } from '@/daao-sdk/abi/uniFactory';
import { UNI_POOL_ABI } from '@/daao-sdk/abi/uniPool';
import useGetUserTickets from '@/hooks/useGetUserTickets';
import { Button } from '@/shadcn/components/ui/button';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/shadcn/components/ui/tabs';
import { BigNumber, ethers } from 'ethers';
import { motion } from 'framer-motion';
import { Settings2 } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAccount, useReadContracts } from 'wagmi';
import { useFetchBalance } from '../../hooks/useFetchBalance';
import CollectedTickets from '../collectedTickets';
import { ModalWrapper } from '../modalWrapper';
import SlippageModal from '../slippageModal';
import TicketPurchase from '../ticket';
import { useFundContext } from './FundContext';
import ModeTokenLogo from '/public/assets/mode.png';
import Decimal from 'decimal.js';

const BuySellCard = () => {
  const account = useAccount();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amountFrom, setAmountFrom] = useState('');
  const [amountTo, setAmountTo] = useState('0');
  const [firstTokenMode, setFirstTokenMode] = useState(false);
  const [currentSqrtPrice, setCurrentSqrtPrice] = useState<string>('');
  const [slippageOpen, setSlippageOpen] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState('1');
  const [isSwapping, setIsSwapping] = useState(false);
  const [modeBalance, setModeBalance] = useState('0');
  const [daoTokenAddress, setDaoTokenAddress] = useState('');
  const [poolAddress, setPoolAddress] = useState('');
  const { daoBalance, setDaoBalance } = useFundContext();
  const { ticketIds, refetch: refetchTickets } = useGetUserTickets();
  const accountAddress = account.address as `0x${string}`;
  const { data: fetchedData, refreshData } = useFetchBalance();

  const { data: daoReadData, refetch } = useReadContracts({
    contracts: daoTokenAddress
      ? [
          {
            address: daoTokenAddress as `0x${string}`,
            abi: DAO_TOKEN_ABI,
            functionName: 'balanceOf',
            args: [accountAddress],
          },
        ]
      : [],
  });

  useEffect(() => {
    console.log('daoToken is', fetchedData?.daoToken);
    if (!fetchedData) return;
    if (!daoTokenAddress) {
      setDaoTokenAddress(fetchedData?.daoToken);
    }
    setModeBalance(fetchedData.balance);
  }, [fetchedData, daoTokenAddress, activeTab]);

  useEffect(() => {
    if (daoReadData && daoReadData[0]?.result) {
      const rawBal = daoReadData[0].result as bigint;
      const formatted = ethers.utils.formatUnits(rawBal, 18);
      setDaoBalance(formatted);
    }
  }, [daoReadData, setDaoBalance, activeTab]);

  useEffect(() => {
    const fetchPoolAddress = async () => {
      if (!daoTokenAddress) return;
      if (!window.ethereum) {
        console.log('MetaMask is not installed');
        return;
      }

      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const factoryContract = new ethers.Contract(veloFactoryAddress, UNI_FACTORY_ABI, provider);
        const pool = await factoryContract.callStatic.getPool(wmonTokenAddress, daoTokenAddress, tickSpacing);

        if (pool && pool !== ethers.constants.AddressZero) {
          setPoolAddress(pool);
          console.log('Pool Address:', pool);
        } else {
          console.log('Pool does not exist for these tokens.');
        }
      } catch (error) {
        console.error('Error fetching pool address:', error);
      }
    };

    fetchPoolAddress();
  }, [daoTokenAddress]);

  useEffect(() => {
    if (!poolAddress) return;
    fetchPoolTokens();
    fetchSlot0();
    fetchBalances();
    setAmountFrom('');
    setAmountTo('0');
  }, [activeTab, poolAddress]);

  async function fetchSlot0() {
    if (!poolAddress) return;
    if (!window.ethereum) return;
    try {
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      setCurrentSqrtPrice(zeroForOne ? '4295128750' : '1461446703485210103287273052203988822378723970300');

      // const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);

      // const slot0 = await poolContract.slot0();

      // console.log('sqrtPriceX96:', slot0.sqrtPriceX96.toString());

      // setCurrentSqrtPrice(slot0.sqrtPriceX96.toString());
    } catch (error) {
      console.error('Error fetching slot0:', error);
    }
  }

  async function fetchPoolTokens() {
    if (!poolAddress) return;
    if (!window.ethereum) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const poolContract = new ethers.Contract(poolAddress, UNI_POOL_ABI, provider);
      const t0 = await poolContract.token0();
      const t1 = await poolContract.token1();
      if (t0 === wmonTokenAddress) {
        setFirstTokenMode(true);
      } else if (t1 === wmonTokenAddress) {
        setFirstTokenMode(false);
      }
    } catch (error) {
      console.error('Error fetching pool tokens:', error);
    }
  }

  async function fetchBalances() {
    if (!window.ethereum) return;
    if (activeTab !== 'buy') {
      setModeBalance('0');
    }
  }

  function computeZeroForOne() {
    if (firstTokenMode === null) {
      return false;
    }
    if (firstTokenMode) {
      return activeTab === 'buy' ? true : false;
    } else {
      return activeTab === 'buy' ? false : true;
    }
  }

  const zeroForOne = computeZeroForOne();

  async function simulateSwap(newFromValue: string) {
    if (!window.ethereum || !poolAddress || !currentSqrtPrice) return;
    try {
      if (activeTab === 'buy') {
        if (Number(modeBalance) < Number(newFromValue)) {
          toast.error('Insufficient balance');
          setAmountTo('0');
          return;
        }
      }
      if (activeTab === 'sell') {
        if (Number(daoBalance) < Number(newFromValue)) {
          toast.error('Insufficient balance');
          setAmountTo('0');
          return;
        }
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const quoter = new ethers.Contract(quoterAddress, SWAP_ROUTER_SIMULATE, signer);
      const amountSpecified = ethers.utils.parseUnits(newFromValue, 18);

      if (!Number(amountSpecified)) {
        return;
      }
      if (!currentSqrtPrice) return;

      const amount1 = await quoter.callStatic.quoteExactInputSingle(
        poolAddress,
        zeroForOne,
        amountSpecified.toString(),
        zeroForOne ? '4295128750' : '1461446703485210103287273052203988822378723970300',
      );

      let outBnAbs = amount1;
      if (outBnAbs.lt(0)) {
        outBnAbs = outBnAbs.mul(-1);
      }
      const outTokens = ethers.utils.formatUnits(outBnAbs, 18);

      console.log('Simulated swap output:', outTokens);
      setAmountTo(outTokens);
    } catch (err) {
      console.error('Error simulating swap:', err);
      setAmountTo('0');
    }
  }

  function handleFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setAmountFrom(val);
    if (!val) {
      setAmountTo('0');
      return;
    }
    simulateSwap(val);
  }

  async function checkAndApproveDAO(signer: ethers.Signer) {
    if (!daoTokenAddress) return;
    const userAddress = await signer.getAddress();
    const daoTokenContract = new ethers.Contract(daoTokenAddress, DAO_TOKEN_ABI, signer);

    const requiredAmountBN = ethers.utils.parseUnits(amountFrom || '0', 18);

    const currentAllowance: ethers.BigNumber = await daoTokenContract.allowance(userAddress, swapRouterAddress);
    if (currentAllowance.lt(requiredAmountBN)) {
      console.log('Approving DAO tokens...');
      const approveTx = await daoTokenContract.approve(swapRouterAddress, requiredAmountBN);
      await approveTx.wait();
      console.log('DAO token approval completed!');
    }
  }

  async function checkAndApproveMODE(signer: ethers.Signer) {
    if (!daoTokenAddress) return;
    const userAddress = await signer.getAddress();
    const ModeTokenContract = new ethers.Contract(wmonTokenAddress, TOKEN_ABI, signer);

    const requiredAmountBN = ethers.utils.parseUnits(amountFrom || '0', 18);

    const currentAllowance: ethers.BigNumber = await ModeTokenContract.allowance(userAddress, swapRouterAddress);
    console.log('Current allowance:', currentAllowance.toString());
    if (currentAllowance.lt(requiredAmountBN)) {
      console.log('Approving DAO tokens...');
      const approveTx = await ModeTokenContract.approve(swapRouterAddress, requiredAmountBN);
      await approveTx.wait();
      console.log('DAO token approval completed!');
    }
  }

  async function handleSwap() {
    try {
      setIsSwapping(true);

      if (!window.ethereum) throw new Error('No Ethereum provider found');
      if (!amountFrom) {
        toast.error('No amount specified');
        return;
      }
      if (amountFrom === '0') {
        toast.error('Amount must be greater than 0');
        return;
      }
      if (activeTab === 'buy' && Number(modeBalance) < Number(amountFrom)) {
        toast.error('Insufficient balance');
        return;
      }
      if (activeTab === 'sell' && Number(daoBalance) < Number(amountFrom)) {
        toast.error('Insufficient balance');
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      if (activeTab === 'sell') {
        await checkAndApproveDAO(signer);
      } else if (activeTab === 'buy') {
        await checkAndApproveMODE(signer);
      }
      const clPoolRouter = new ethers.Contract(swapRouterAddress, ROUTER_ABI, signer);
      const amountSpecified = ethers.utils.parseUnits(amountFrom || '0', 'ether');
      console.log('amountSpecified:', amountSpecified.toString());

      const slipDecimal = parseFloat(slippageTolerance) / 100;
      console.log('Slippage decimal:', slipDecimal);
      const quotedOut = amountTo;
      const minOutput = new Decimal(quotedOut).mul(1 - slipDecimal).toFixed(18);

      const minOutputBN = ethers.utils.parseUnits(minOutput, 18);
      console.log('minOutput:', minOutputBN);

      const deadline = Math.floor(Date.now() / 1000) + 60 * 5;
      console.log('deadline:', deadline);
      if (!currentSqrtPrice) {
        throw new Error('No currentSqrtPrice found. Please ensure slot0 is loaded.');
      }
      const sqrtPriceLimitX96 = zeroForOne ? '4295128750' : '1461446703485210103287273052203988822378723970300';

      const tx = await clPoolRouter.getSwapResult(
        poolAddress,
        zeroForOne,
        amountSpecified,
        sqrtPriceLimitX96,
        minOutputBN,
        deadline,
      );

      const receipt = await tx.wait();
      // alert(`Swap successful!\nTransaction Hash: ${receipt.transactionHash}`)

      await fetchSlot0();
      setAmountFrom('');
      setAmountTo('0');
      console.log('Swap successful!', receipt);
      toast.success('Swap/Buy successful');
    } catch (error) {
      console.error('Error during swap:', error);
    } finally {
      if (activeTab === 'buy') {
        // Spent PAYMENT TOKEN
        setModeBalance((prev) => (Number(prev) - Number(amountFrom)).toString());
        // Gained DAO
        setDaoBalance((prev) => (Number(prev) + Number(amountTo)).toString());
      } else {
        // Spent DAO
        setDaoBalance((prev) => (Number(prev) - Number(amountFrom)).toString());
        // Gained PAYMENT TOKEN
        setModeBalance((prev) => (Number(prev) + Number(amountTo)).toString());
      }
      refetch();
      refreshData();
      setIsSwapping(false);
      setAmountFrom('');
      setAmountTo('0');
    }
  }
  const fromLabel = activeTab === 'buy' ? 'WMON' : 'ScrollDao';
  const toLabel = activeTab === 'buy' ? 'ScrollDao' : 'WMON';
  const [isBurnTicketModalOpen, setIsBurnTicketModalOpen] = useState(false);
  const [isCollectedTicketModalOpen, setIsCollectedTicketModalOpen] = useState(false);
  const openBurnTicketModal = useCallback(() => setIsBurnTicketModalOpen(true), []);
  const closeBurnTicketModal = useCallback(() => setIsBurnTicketModalOpen(false), []);
  const openCollectedTicketModal = useCallback(() => setIsCollectedTicketModalOpen(true), []);
  const closeCollectedTicketModal = useCallback(() => setIsCollectedTicketModalOpen(false), []);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  const openSettingModal = useCallback(() => setIsSettingModalOpen(true), []);
  const closeSettingModal = useCallback(() => setIsSettingModalOpen(false), []);

  const handleBurnTicketModal = () => {
    if (account.address) {
      openBurnTicketModal();
    } else {
      toast.error('Wallet Not Connected');
    }
  };

  return (
    <Card className="h-fit w-full max-w-xl bg-[#0e0e0e] text-white border-none">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'buy' | 'sell')} className="w-full h-12">
            <div className="relative w-full">
              <TabsList className="flex gap-4 bg-[#1b1c1d] h-12 relative p-1 rounded-md">
                <motion.div
                  layoutId="tabBackground"
                  className="absolute top-1 left-1 bottom-1 bg-teal-40 rounded-md w-[50%]"
                  initial={false}
                  animate={{
                    x: activeTab === 'buy' ? '0%' : '100%',
                  }}
                  transition={{ type: 'tween', duration: 0.3 }}
                />

                {/* Buy Tab */}
                <TabsTrigger
                  value="buy"
                  className={`relative w-full lg:text-xl md:text-lg sm:text-md px-4 py-2 transition-all ${
                    activeTab === 'buy' ? 'text-black' : 'text-white'
                  }`}
                >
                  Buy
                </TabsTrigger>

                {/* Sell Tab */}
                <TabsTrigger
                  value="sell"
                  className={`relative w-full lg:text-xl md:text-lg sm:text-md px-4 py-2 transition-all ${
                    activeTab === 'sell' ? 'text-black' : 'text-white'
                  }`}
                >
                  Sell
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* <div className="flex w-full gap-2 items-center justify-between">
          <button
            onClick={() => setAmountFrom('1000')}
            className="bg-gray-40 rounded-md p-2 text-sm active:scale-95 transition-transform ease-in-out duration-150"
          >
            1000 PAYMENT TOKEN
          </button>
          <button
            onClick={() => setAmountFrom('10000')}
            className="bg-gray-40 rounded-md p-2 text-sm active:scale-95 transition-transform ease-in-out duration-150"
          >
            10000 PAYMENT TOKEN
          </button>
          <button
            onClick={() => setAmountFrom('50000')}
            className="bg-gray-40 rounded-md p-2 text-sm active:scale-95 transition-transform ease-in-out duration-150"
          >
            50000 PAYMENT TOKEN
          </button>
          <button
            onClick={() => setAmountFrom('100000')}
            className="bg-gray-40 rounded-md p-2 text-sm active:scale-95 transition-transform ease-in-out duration-150"
          >
            100000 PAYMENT TOKEN
          </button>
        </div> */}

        <Card className="bg-gray-50 border-2 border-gray-20">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="w-40">
              <p className="text-left text-[#aeb3b6] text-sm">FROM</p>
              <input
                type="number"
                placeholder="0"
                value={amountFrom}
                onChange={handleFromChange}
                className={`appearance-none w-full bg-transparent border-1 p-0 text-3xl w-100 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none `}
              />
            </div>
            <div className="space-y-2 text-right">
              <div className="text-sm flex flex-row justify-between">
                <span className="text-[#aeb3b6]">
                  Balance: {activeTab === 'buy' ? Number(modeBalance).toFixed(3) : Number(daoBalance).toFixed(3)}
                </span>
                {/* <Button
                  variant="link"
                  className="text-[#39db83] p-0 h-auto font-normal"
                  onClick={() => {
                    setAmountFrom("1")
                    simulateSwap("1")
                  }}
                >
                  MAX
                </Button> */}
              </div>
              <Button variant="outline" className="bg-transparent border-[#242626] hover:bg-[#242626] hover:text-white">
                <Image
                  src={activeTab === 'buy' ? CURRENT_DAO_IMAGE : CURRENT_DAO_IMAGE}
                  alt={activeTab === 'buy' ? 'PT' : 'DAO Token'}
                  width={16}
                  height={16}
                  className="mr-2"
                />
                {fromLabel}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-2 border-gray-20">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="w-40">
              <p className="text-left  text-[#aeb3b6] text-sm">TO</p>
              <input
                type="number"
                placeholder="0"
                value={amountTo}
                onChange={(e) => setAmountTo(e.target.value)}
                className={`appearance-none w-full bg-transparent p-0 text-3xl [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-0 outline-none`}
              />
            </div>
            <div className="space-y-2 text-right">
              <div className="text-sm flex flex-row justify-between"></div>
              <Button variant="outline" className="bg-transparent border-[#242626] hover:bg-[#242626] hover:text-white">
                <Image
                  src={activeTab === 'buy' ? CURRENT_DAO_IMAGE : ModeTokenLogo}
                  alt={activeTab === 'buy' ? 'DAO Token' : 'PAYMENT TOKEN Token'}
                  width={16}
                  height={16}
                  className="mr-2"
                />
                {toLabel}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* <div className="flex justify-between text-sm">
          <div className="text-left space-y-1">
            <p className="text-[#aeb3b6] lg:text-lg md:text-md sm:text-sm">Price Impact</p>
            <p className="text-[#aeb3b6] lg:text-lg md:text-md sm:text-sm">Exchange</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="lg:text-lg md:text-md sm:text-sm">0.00%</p>
            <p className="lg:text-lg md:text-md sm:text-sm">-</p>
          </div>
        </div> */}
        <div className="flex justify-between items-start">
          <p className="text-sm">Slippage</p>
          <p className="text-sm">{slippageTolerance}</p>
        </div>

        <Button
          className="w-full bg-teal-50 text-black hover:bg-teal-60 active:scale-95 transition-transform ease-in-out duration-150"
          onClick={handleSwap}
          disabled={isSwapping}
          style={{ height: '3rem' }}
        >
          {isSwapping ? 'Swapping...' : 'Swap'}
        </Button>
        <button
          type="button"
          title="settings"
          onClick={openSettingModal}
          className="p-2 hover:bg-[#1b1c1d] rounded-md flex items-center gap-4 text-paleGreen"
        >
          <Settings2 size={20} className="text-paleGreen" />
          Set Slippage
        </button>
        <ModalWrapper isOpen={isSettingModalOpen} onClose={closeSettingModal}>
          <SlippageModal onClose={closeSettingModal} setSlippageTolerance={setSlippageTolerance} />
        </ModalWrapper>
        {/* @devs please don't remove this comented code */}
        {/* <Button
          className="w-full bg-white text-black hover:bg-gray-200 active:scale-95 transition-transform ease-in-out duration-150"
          onClick={handleBurnTicketModal}
          style={{ height: '3rem' }}
        >
          Burn Tokens and get tickets.
        </Button>

        {ticketIds && (
          <Button
            className="w-full bg-white text-black hover:bg-gray-200 active:scale-95 transition-transform ease-in-out duration-150"
            onClick={openCollectedTicketModal}
            disabled={isSwapping}
            style={{ height: '3rem' }}
          >
            Collected Tickets.
          </Button>
        )} */}
        <ModalWrapper isOpen={isBurnTicketModalOpen} onClose={closeBurnTicketModal}>
          <TicketPurchase onClose={closeBurnTicketModal} onTicketsUpdated={refetchTickets} />
        </ModalWrapper>
        <ModalWrapper isOpen={isCollectedTicketModalOpen} onClose={closeCollectedTicketModal}>
          <CollectedTickets onClose={closeCollectedTicketModal} tickets={ticketIds} />
        </ModalWrapper>
      </CardContent>
    </Card>
  );
};

export default BuySellCard;
