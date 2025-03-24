import { lpFarmAddress, nonFungiblePositionManagerAddress } from '@/constants/addresses';
import { NON_FUNGIBLE_POSITION_MANAGER_ABI } from '@/daao-sdk/abi/nonFungiblePositionManager';
import { VELO_POOL_ABI } from '@/daao-sdk/abi/veloPool';
import { Position } from '@/types/farm';
import { CLPoolUtils } from '@/utils/v3Pools';
import { usePublicClient, useWriteContract } from 'wagmi';
import { useAccount } from 'wagmi';
import useTokenPrice from '../useTokenPrice';
import { Address, encodeAbiParameters, formatUnits, type Abi, type TransactionReceipt } from 'viem';
import { LP_FARM_ABI } from '@/daao-sdk/abi/lpFarm';
import {
  LP_FARM_END_TIME,
  LP_FARM_POOL,
  LP_FARM_REFUNDEE,
  LP_FARM_REWARD_TOKEN,
  LP_FARM_START_TIME,
} from '@/constants/lpFarm';
import { useToast } from '../use-toast';
import { handleViemTransactionError } from '@/utils/approval';
import { V3_STACKER_ABI } from '@/daao-sdk/abi/v3Stacker';
import { ethers } from 'ethers';
import { toast as reactToast } from 'react-toastify'; // Ensure to import react-toastify's toast function

const POOL_ADDRESS = '0xf70e76cc5a39aad1953bef3d1647c8b36f3f6324';
const UNISWAP_V3_STAKER = '0xd9cC1D4565102AE6118476EF0E531e7956487099';

const useLpFarms = () => {
  // const { toast } = useToast();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { fetchTokenPrice } = useTokenPrice();
  const { writeContractAsync } = useWriteContract();

  // const KEY_STRUCT = [LP_FARM_REWARD_TOKEN, LP_FARM_POOL, LP_FARM_START_TIME, LP_FARM_END_TIME, LP_FARM_REFUNDEE];
  const KEY_STRUCT2 = [
    LP_FARM_REWARD_TOKEN,
    LP_FARM_POOL,
    BigInt(LP_FARM_START_TIME),
    BigInt(LP_FARM_END_TIME),
    LP_FARM_REFUNDEE,
  ];

  const getPositionsIds = async () => {
    try {
      const response = await publicClient?.readContract({
        address: nonFungiblePositionManagerAddress,
        abi: NON_FUNGIBLE_POSITION_MANAGER_ABI,
        functionName: 'userPositions',
        args: [address, POOL_ADDRESS],
      });
      return response as bigint[];
    } catch (error) {
      console.error(error);
      return [] as bigint[];
    }
  };

  const getNumberOfStakedForPosition = async (tokenId: bigint) => {
    try {
      const response = (await publicClient?.readContract({
        address: UNISWAP_V3_STAKER,
        abi: V3_STACKER_ABI,
        functionName: 'deposits',
        args: [tokenId],
      })) as [Address, number, number, number]; // Type assertion for the tuple response
      return response[1];
    } catch (error) {
      console.error(error);
      return BigInt(0);
    }
  };

  const getPositionDetails = async (positionId: bigint) => {
    try {
      const positionDetails = (await publicClient?.readContract({
        address: nonFungiblePositionManagerAddress,
        abi: NON_FUNGIBLE_POSITION_MANAGER_ABI,
        functionName: 'positions',
        args: [positionId],
      })) as [bigint, Address, Address, Address, number, number, number, bigint, bigint, bigint, bigint, bigint];
      const numberOfStakes = await getNumberOfStakedForPosition(positionId);
      const [
        nonce,
        operator,
        token0,
        token1,
        tickSpacing,
        tickLower,
        tickUpper,
        liquidity,
        feeGrowthInside0LastX128,
        feeGrowthInside1LastX128,
        tokensOwed0,
        tokensOwed1,
      ] = positionDetails;
      const poolDetails = (await publicClient?.readContract({
        address: '0xF70e76cC5a39Aad1953BeF3D1647C8B36f3f6324',
        abi: VELO_POOL_ABI,
        functionName: 'slot0',
      })) as [bigint, number, number, number, number, boolean];

      console.log(positionDetails, 'positionDetailspositionDetails');

      const amounts = CLPoolUtils.getTokenAmountsForLiquidity({
        liquidity: liquidity.toString(),
        sqrtPriceX96: poolDetails[0].toString(),
        lowerTick: tickLower,
        upperTick: tickUpper,
      });

      const tokenPricePromises = [fetchTokenPrice(token0), fetchTokenPrice(token1)];
      const [token0Price, token1Price] = await Promise.all(tokenPricePromises);

      const token0Amount = Number(formatUnits(BigInt(amounts.amount0InWei), 18)) * token0Price;
      const token1Amount = Number(formatUnits(BigInt(amounts.amount1InWei), 18)) * token1Price;

      const liquidityUsd = (token0Amount + token1Amount).toFixed(4);

      return {
        nonce,
        operator,
        token0,
        token1,
        tickSpacing,
        tickLower,
        tickUpper,
        liquidity,
        feeGrowthInside0LastX128,
        feeGrowthInside1LastX128,
        tokensOwed0,
        tokensOwed1,
        liquidityUsd,
        id: Number(positionId),
        apr: 0,
        numberOfStakes,
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getPositionList = async () => {
    try {
      const positionIdList = await getPositionsIds();
      const positionList = await Promise.all(positionIdList.map((positionId) => getPositionDetails(positionId)));
      return positionList as Position[];
    } catch (error) {
      console.error(error);
      return [] as Position[];
    }
  };

  // For a single incentive
  const encodeSingleIncentive = (incentiveKey: (string | bigint)[]) => {
    return ethers.utils.defaultAbiCoder.encode(
      ['(address rewardToken, address pool, uint256 startTime, uint256 endTime, address refundee)'],
      [incentiveKey],
    );
  };

  const stakeFarm = async (tokenId: BigInt) => {
    try {
      const encodedData = encodeSingleIncentive(KEY_STRUCT2);
      console.log([address, UNISWAP_V3_STAKER, tokenId, encodedData], 'stakeFarm');
      const tx = await writeContractAsync({
        address: nonFungiblePositionManagerAddress,
        abi: NON_FUNGIBLE_POSITION_MANAGER_ABI,
        functionName: 'safeTransferFrom',
        args: [address, UNISWAP_V3_STAKER, tokenId, encodedData],
      });

      const receipt = (await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      })) as TransactionReceipt;

      if (receipt.status === 'success') {
        reactToast.success('Your Stake was Successfull');
      }
    } catch (error) {
      console.error(error);
      const { errorMsg } = handleViemTransactionError({
        abi: LP_FARM_ABI as Abi,
        error,
      });
      reactToast.error(errorMsg);
    }
  };

  const unStakeFarm = async (tokenId: BigInt) => {
    try {
      console.log([KEY_STRUCT2, tokenId], 'keystruct2');
      const tx = await writeContractAsync({
        address: UNISWAP_V3_STAKER,
        abi: V3_STACKER_ABI,
        functionName: 'unstakeToken',
        args: [KEY_STRUCT2, tokenId],
      });
      const receipt = (await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      })) as TransactionReceipt;
      console.log(receipt, 'receiptreceipt');
      if (receipt.status === 'success') {
        reactToast.success('Your Unstake was Successfull');
      }
      return receipt;
    } catch (error) {
      console.error(error);
      const { errorMsg } = handleViemTransactionError({
        abi: LP_FARM_ABI as Abi,
        error,
      });
      reactToast.error(errorMsg);
    }
  };

  const getStackedPositionsIds = async () => {
    try {
      const stackedPositions = (await publicClient?.readContract({
        address: UNISWAP_V3_STAKER,
        abi: V3_STACKER_ABI,
        functionName: 'getUserStakedTokens',
        args: [address],
      })) as bigint[];
      console.log({ stackedPositions });
      return stackedPositions;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getStackedPositionList = async (): Promise<Position[]> => {
    try {
      const stackedPositionsIds = await getStackedPositionsIds();

      const rewardInfo = await getRewardInfo(stackedPositionsIds);

      const positionResults = await Promise.allSettled(
        stackedPositionsIds.map((positionId) => getPositionDetails(positionId)),
      );

      // Filter out rejected promises and map successful results to Position objects
      const stackedPositionList = positionResults
        .filter((result): result is PromiseFulfilledResult<Position> => result.status === 'fulfilled')
        .map((result) => {
          const position = result.value;
          return { ...position, rewardInfo: rewardInfo[position.id.toString()] };
        });

      // Log any failed position fetches
      positionResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to fetch position ${stackedPositionsIds[index]}:`, result.reason);
        }
      });

      return stackedPositionList;
    } catch (error) {
      console.error('Error fetching staked positions:', error);
      return [];
    }
  };

  const getRewardInfo = async (tokenIds: BigInt[]) => {
    try {
      const rewardDetails = await publicClient?.multicall({
        contracts: tokenIds.map((tokenId) => ({
          address: UNISWAP_V3_STAKER as Address,
          abi: V3_STACKER_ABI,
          functionName: 'getRewardInfo',
          args: [KEY_STRUCT2, tokenId],
        })),
      });

      const rewardInfo = rewardDetails?.reduce((acc: { [key: string]: bigint }, item: any, index: number) => {
        const firstValue = item?.result?.[0] ?? BigInt(0);
        const tokenId = tokenIds[index];
        acc[tokenId.toString()] = firstValue;
        return acc;
      }, {});

      return rewardInfo || {};
    } catch (error) {
      console.error(error);
      const { errorMsg } = handleViemTransactionError({
        abi: LP_FARM_ABI as Abi,
        error,
      });
      reactToast.error(errorMsg);

      return {};
    }
  };

  const getClaimableRewards = async () => {
    try {
      const claimableRewards = (await publicClient?.readContract({
        address: UNISWAP_V3_STAKER,
        abi: V3_STACKER_ABI,
        functionName: 'rewards',
        args: [LP_FARM_REWARD_TOKEN, address],
      })) as bigint;
      return claimableRewards;
    } catch (error) {
      console.error(error);
      return BigInt(0);
    }
  };

  const claimRewards = async (rewardTokenAmount: BigInt) => {
    console.log([LP_FARM_REWARD_TOKEN, address, rewardTokenAmount], 'fgyhbvbhgbnvb');
    try {
      const tx = await writeContractAsync({
        address: UNISWAP_V3_STAKER,
        abi: V3_STACKER_ABI,
        functionName: 'claimReward',
        args: [LP_FARM_REWARD_TOKEN, address, rewardTokenAmount],
      });
      const receipt = (await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      })) as TransactionReceipt;
      if (receipt.status === 'success') {
        reactToast.success('Your Stake was Successful');
      }
      return receipt;
    } catch (error) {
      console.error(error);
      const { errorMsg } = handleViemTransactionError({
        abi: LP_FARM_ABI as Abi,
        error,
      });
      reactToast.error(errorMsg);
    }
  };

  const withdrawPosition = async (tokenId: bigint) => {
    try {
      const encodedData = encodeSingleIncentive(KEY_STRUCT2);
      const tx = await writeContractAsync({
        address: UNISWAP_V3_STAKER,
        abi: V3_STACKER_ABI,
        functionName: 'withdrawToken',
        args: [tokenId, address, encodedData],
      });
      const receipt = (await publicClient?.waitForTransactionReceipt({
        hash: tx,
        confirmations: 1,
      })) as TransactionReceipt;
      if (receipt.status === 'success') {
        reactToast.success('Your Withdraw was Successful');
      }
      return receipt;
    } catch (error) {
      console.error(error);
      const { errorMsg } = handleViemTransactionError({
        abi: LP_FARM_ABI as Abi,
        error,
      });
      reactToast.error(errorMsg);
    }
  };

  return {
    getPositionList,
    getPositionDetails,
    stakeFarm,
    getClaimableRewards,
    unStakeFarm,
    claimRewards,
    getStackedPositionsIds,
    getStackedPositionList,
    withdrawPosition,
  };
};

export default useLpFarms;
