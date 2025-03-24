import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../daao-sdk/abi/abi';
import { daoAddress } from '@/constants/addresses';

const TIER_LABELS = ['None', 'Platinum', 'Gold', 'Silver'];
export const getContractData = async () => {
  if (!(window as any).ethereum) {
    throw new Error('Ethereum wallet provider not found. Please install MetaMask.');
  }
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  console.log('Provider object created:', provider);

  const signer = provider.getSigner();
  console.log('Signer object created:', signer);
  const userAddress = await signer.getAddress();

  const contract = new ethers.Contract(daoAddress, CONTRACT_ABI, provider);
  console.log('Contract object created:', contract);

  //   const start = await contract.getStartDate();
  const end = await contract.fundraisingDeadline();
  const fundraisingGoal = (await contract.fundraisingGoal()).toString();
  const totalRaised = (await contract.totalRaised()).toString();
  const goalReached = await contract.goalReached();
  const finalisedFundraising = await contract.fundraisingFinalized();
  const daoToken = await contract.daoToken();
  const veloFactory = await contract.VELODROME_FACTORY();
  const iswhitelistedData = await contract.getWhitelistInfo(userAddress);
  const iswhitelisted = iswhitelistedData.isActive;
  console.log('iswhitelisted is ', iswhitelisted);

  const userTiers = await contract.getWhitelistInfo(userAddress);
  const tierNumber = userTiers.tier;
  const maxLimit = Number((await contract.tierLimits(tierNumber)).toString()) / 10 ** 18;

  const userTierLabel = TIER_LABELS[tierNumber];
  console.log('userTiers is ', goalReached, finalisedFundraising);

  console.log('userTiers is ', userTierLabel);

  console.log('end is ', end.toString());
  console.log('fundraisingGoal is ', fundraisingGoal);
  console.log('totalRaised is ', totalRaised);

  const endDate = new Date(end.toNumber() * 1000);
  console.log('endDate is ', endDate);

  // 6. Return all data in an object
  return {
    maxLimit,
    tierNumber,
    iswhitelisted,
    veloFactory,
    daoToken,
    goalReached,
    finalisedFundraising,
    endDate,
    fundraisingGoal,
    totalRaised,
    userTierLabel,
  };
};
