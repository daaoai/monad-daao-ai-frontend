import { useEffect, useState } from 'react';
// import { useToast } from '@/hooks/use-toast';
import { useReadContracts } from 'wagmi';
import { ethers } from 'ethers';
import { CONTRACT_ABI } from '@/daao-sdk/abi/abi';
import { MODE_ABI } from '@/daao-sdk/abi/mode';
import { daoAddress, wmonTokenAddress } from '@/constants/addresses';

const wagmiModeContract = {
  address: wmonTokenAddress,
  abi: MODE_ABI,
} as const;

const wagmiDaoContract = {
  address: daoAddress,
  abi: CONTRACT_ABI,
} as const;

const TIER_LABELS = ['None', 'Platinum', 'Gold', 'Silver'];

//Fetch Mode Balance
export const useFetchBalance = (accountAddress: `0x${string}` | undefined) => {
  const [data, setData] = useState({
    balance: '0',
    tierNumber: 0,
    isWhitelisted: false,
    maxLimit: 0,
    contributedAmountYet: 0,
    daoToken: '',
    goalReached: false,
    finalisedFundraising: false,
    endDate: '',
    fundraisingGoal: '',
    totalRaised: '',
    userTierLabel: 'None',
  });

  const {
    data: contractData,
    error,
    refetch,
  } = useReadContracts({
    contracts: [
      // Fetch balance
      {
        ...wagmiModeContract,
        functionName: 'balanceOf',
        args: accountAddress ? [accountAddress] : [],
      },
      // Fetch whitelist info
      {
        ...wagmiDaoContract,
        functionName: 'getWhitelistInfo',
        args: accountAddress ? [accountAddress] : [],
      },
      // Fetch fundraising goal
      {
        ...wagmiDaoContract,
        functionName: 'fundraisingGoal',
        args: [],
      },
      // Fetch total raised
      {
        ...wagmiDaoContract,
        functionName: 'totalRaised',
        args: [],
      },
      // Fetch goal reached status
      {
        ...wagmiDaoContract,
        functionName: 'goalReached',
        args: [],
      },
      // Fetch finalised fundraising status
      {
        ...wagmiDaoContract,
        functionName: 'fundraisingFinalized',
        args: [],
      },
      // Fetch fundraising deadline
      {
        ...wagmiDaoContract,
        functionName: 'fundraisingDeadline',
        args: [],
      },
      // Fetch DAO Token Address
      {
        ...wagmiDaoContract,
        functionName: 'daoToken',
        args: [],
      },
      //Contributions
      {
        ...wagmiDaoContract,
        functionName: 'contributions',
        args: accountAddress ? [accountAddress] : [],
      },
      // payment token adrres
      {
        ...wagmiDaoContract,
        functionName: 'PAYMENT_TOKEN',
      },
    ],
  });
  console.log('data is', contractData);
  const { data: tierLimitData, refetch: refetchTierLimit } = useReadContracts({
    contracts: [
      {
        ...wagmiDaoContract,
        functionName: 'tierLimits',
        args: data.tierNumber ? [data.tierNumber] : [],
      },
    ],
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching contract data:', error);
      return;
    }

    if (contractData) {
      console.log('Fetched contract data:', contractData);

      // Extracting data from contract responses
      const balanceRaw = contractData[0]?.result as bigint;
      const whitelistInfoData = contractData[1]?.result as Array<any>;
      const fundraisingGoal = contractData[2]?.result?.toString() || '0';
      const totalRaised = contractData[3]?.result?.toString() || '0';
      const goalReached = contractData[4]?.result as boolean;
      const finalisedFundraising = contractData[5]?.result as boolean;
      const end = contractData[6]?.result as bigint;
      const daoToken = contractData[7]?.result as string;
      const contributedAmountYet = Number(contractData[8]?.result) / 10 ** 18;

      const modeBalance = balanceRaw ? ethers.utils.formatUnits(balanceRaw, 18) : '0';

      const isWhitelisted = whitelistInfoData ? whitelistInfoData[0] : false;
      const tierNumber = whitelistInfoData ? Number(whitelistInfoData[1]) : 0;

      const userTierLabel = TIER_LABELS[tierNumber] || 'None';
      setData((prev) => ({
        ...prev,

        balance: modeBalance,
        tierNumber,
        isWhitelisted,
        contributedAmountYet,
        daoToken,
        goalReached,
        finalisedFundraising,
        endDate: (Number(end) * 1000).toString(),
        fundraisingGoal,
        totalRaised,
        userTierLabel,
      }));
      if (tierLimitData) {
        const maxLimitRaw = tierLimitData[0]?.result as bigint;
        const maxLimit = maxLimitRaw ? Number(maxLimitRaw.toString()) / 10 ** 18 : 0;
        setData((prev) => ({ ...prev, maxLimit }));
      }
    }
  }, [contractData, tierLimitData, error]);

  const refreshData = async () => {
    console.log('🔄 Refetching contract data...');
    await refetch();
    await refetchTierLimit();
  };
  console.log({ Pk: data });
  return { data, refreshData };
};
