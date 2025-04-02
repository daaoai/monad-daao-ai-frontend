import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAccount, useReadContracts } from 'wagmi';
// import { useFetchBalance } from "./fetchBalance"
import { useFundContext } from './FundContext';
import { DAO_CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { Card, CardContent, CardHeader } from '@/shadcn/components/ui/card';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';
import { Separator } from '@/shadcn/components/ui/separator';
import { handleContribute } from '@/utils/contributeFund';
import { UpcomingFundDetailsProps } from '@/types';
import React from 'react';
import { daoAddress } from '@/constants/addresses';

const wagmiDaoContract = {
  address: daoAddress,
  abi: DAO_CONTRACT_ABI,
} as const;
export default function BurnCard(props: UpcomingFundDetailsProps) {
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { fetchedData, refreshData, updateTotalContributed } = useFundContext();
  const [amount, setAmount] = useState<number>();
  const [balance, setBalance] = useState('');
  const [goalReached, setGoalReached] = useState(false);
  const [tier, setTier] = useState('');
  const [isContributing, setIsContributing] = useState(false);
  const [isWhitelisted, setisWhitelisted] = useState(false);
  const [maxLimit, setMaxLimit] = useState(0);
  const [fundraisingFinalized, setFundraisingFinalized] = useState(false);
  const [leftoutAmount, setLeftoutAmount] = useState(0);
  // const [maxAmount, setMaxAmount] = useState(0);

  useEffect(() => {
    if (fetchedData) {
      if (balance === '' || tier === '' || isWhitelisted === false || maxLimit === 0 || leftoutAmount === 0) {
        setBalance(fetchedData.balance);
        setTier(fetchedData.userTierLabel);
        setisWhitelisted(fetchedData.isWhitelisted);
        setMaxLimit(fetchedData.maxLimit);
        setLeftoutAmount(fetchedData.maxLimit - fetchedData.contributedAmountYet);
      }
      console.log('goalReached is ', fetchedData.goalReached);
      if (fetchedData.goalReached) {
        setGoalReached(true);
      }
      console.log('Balance is ', balance);
    }
  }, [fetchedData]);

  const { data, refetch } = useReadContracts({
    contracts: [
      {
        ...wagmiDaoContract,
        functionName: 'fundraisingFinalized',
      },
    ],
  });

  if (data && typeof data[0]?.result === 'boolean' && data[0]?.result !== fundraisingFinalized) {
    setFundraisingFinalized(data[0]?.result);
  }

  const checkFinalisedFundraising = async () => {
    await refetch();
    if (fetchedData?.finalisedFundraising) {
      window.location.href = '/dapp/1';
    } else {
      toast({
        title: 'Fundraising is not finalised yet',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;
    setAmount(value);
  };
  const handleMaxAmount = () => {
    if (balance === '' || leftoutAmount === 0) return;
    if (Number(balance) > leftoutAmount) {
      setAmount(leftoutAmount);
    } else if (Number(balance) < leftoutAmount) {
      setAmount(Number(balance));
    }
  };

  const handleContributefunction = async () => {
    try {
      if (!isConnected) {
        toast({
          title: 'Please connect your wallet first',
          description: "It looks like your wallet isn't connected",
          variant: 'destructive',
        });
        return;
      }
      if (!amount || amount <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid amount to contribute.',
          variant: 'destructive',
        });
        return;
      }

      if (amount > Number(balance)) {
        toast({
          title: 'You do not have enough balance to contribute this amount',
          variant: 'destructive',
        });

        return;
      }
      if (!isWhitelisted) {
        toast({
          title: 'You are not whitelisted to contribute to this fund',
          variant: 'destructive',
        });
        return;
      }
      setIsContributing(true);

      const tx = await handleContribute(amount.toString());
      if (tx === 0) {
        toast({
          title: 'Amount exceeds tier limit',
          variant: 'destructive',
        });
        setIsContributing(false);
        return;
      }

      if (tx === 5) {
        setBalance((prev) => (Number(prev) - Number(amount)).toFixed(3));
        setLeftoutAmount((prev) => Number((Number(prev) - Number(amount)).toFixed(3)));
      }

      if (tx === 1) {
        toast({
          title: 'Error contributing to fund',
          variant: 'destructive',
        });
        setIsContributing(false);
        return;
      }
      if (tx === 4) {
        toast({
          title: 'Amount exceeds tier limit',
          variant: 'destructive',
        });
        setIsContributing(false);
        return;
      }

      setIsContributing(false);
      toast({
        title: 'Successfully contributed to the fund',
        className: `bg-[#2ca585]`,
      });
      await refreshData();
      updateTotalContributed(amount);
      setAmount(0);
    } catch (error) {
      console.error('Error contributing to fund:', error);
      setIsContributing(false);
    }
  };

  return (
    <Card className="text-left w-full max-w-3xl bg-[#0d0d0d] border-[#383838] text-white font-['Work Sans']">
      {!goalReached ? (
        <>
          <CardHeader className="space-y-9">
            <div className="flex items-center gap-3">
              <span className="text-[#409cff] text-2xl sm:text-3xl font-semibold">Whitelist</span>
              <h2 className="text-2xl sm:text-3xl font-semibold">Allocation</h2>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-black rounded border border-[#383838]">
                <Input
                  type="number"
                  placeholder="0"
                  className="appearance-none bg-transparent border-none text-[#e4e6e7] text-lg sm:text-xl font-medium w-full focus:outline-none"
                  value={amount}
                  onChange={handleInputChange}
                />
                <button className="text-[#e4e6e7] text-sm sm:text-base font-medium" onClick={handleMaxAmount}>
                  MAX
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-medium">
                  Balance: <span className="font-semibold">{Number(balance).toFixed(3)}</span>
                </p>
                <p className="text-base sm:text-lg font-medium">
                  Tier: <span className="font-semibold">{tier}</span>
                </p>
                <p className="text-base sm:text-lg font-medium">
                  Limit Left: <span className="font-semibold">{leftoutAmount} MODE</span>
                </p>

                <Button
                  variant="outline"
                  className="w-full h-12 bg-white text-black text-lg sm:text-xl font-semibold hover:bg-white/80 hover:text-black/90"
                  onClick={handleContributefunction}
                  disabled={isContributing}
                >
                  {isContributing ? 'Contributing...' : 'Contribute'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-[#383838]" />
        </>
      ) : (
        <>
          <div className="space-y-10">
            <h3 className="text-[#409cff] text-2xl sm:text-2xl font-semibold mt-7 mx-4 my-6">Goal Has Been Reached</h3>

            <Button
              className="bg-[#409cff] text-white text-lg sm:text-xl font-semibold hover:bg-[#307bcc] w-100 mx-8"
              onClick={checkFinalisedFundraising}
            >
              Go to Token Dashboard
            </Button>
          </div>
        </>
      )}
      <CardContent className="space-y-8 mt-8">
        <div className="space-y-4">
          <h3 className="text-[#409cff] text-xl sm:text-2xl font-semibold">About Token</h3>
          <div className="text-base sm:text-lg">
            {props.aboutToken
              .trim()
              .split('\n')
              .map((paragraph, index) => (
                <p key={index} className="text-base sm:text-lg">
                  {paragraph}
                  <br />
                </p>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
