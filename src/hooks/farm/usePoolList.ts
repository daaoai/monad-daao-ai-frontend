import { FARM_FACTORY_CONTRACT_ADDRESS } from '@/constants/farm';
import { useAccount, usePublicClient } from 'wagmi';
import useTokenPrice from '../useTokenPrice';
import { formatUnits } from 'viem';
import { FarmPool } from '@/types/farm';
import { FARM_FACTORY_ABI } from '@/daao-sdk/abi/farmFactory';
import { POOL_ABI } from '@/daao-sdk/abi/pool';
import { CARTEL } from '@/daao-sdk/abi/cartel';

const usePoolList = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { fetchTokenPriceDexScreener, fetchTokenPriceCoingecko } = useTokenPrice();
  const getTotalPoolLength = async () => {
    try {
      const response = await publicClient?.readContract({
        address: FARM_FACTORY_CONTRACT_ADDRESS,
        abi: FARM_FACTORY_ABI,
        functionName: 'nitroPoolsLength',
      });
      return response;
    } catch (err) {
      console.log({ err });
      return 0;
    }
  };
  const getPoolAddresses = async () => {
    const totalLengthOfPool = await getTotalPoolLength();
    const length = Number(Number(totalLengthOfPool) || 0);
    const array = new Array(length).fill(0);
    const response = await publicClient?.multicall({
      contracts: array.map((_, index) => ({
        abi: FARM_FACTORY_ABI,
        address: FARM_FACTORY_CONTRACT_ADDRESS,
        functionName: 'getNitroPool',
        args: [index],
      })),
    });
    return response?.map((res) => res.result as `0x${string}`);
  };

  const getPoolDetails = async ({ poolAddress }: { poolAddress: `0x${string}` }) => {
    try {
      const funcNames = ['settings', 'totalDepositAmount', 'rewardsToken1', 'rewardsToken1PerSecond', 'depositToken'];

      const response = await publicClient?.multicall({
        contracts: funcNames.map((functionName, index) => ({
          abi: POOL_ABI,
          address: poolAddress,
          functionName: functionName,
        })),
      });

      const usrInfoFunc = ['userInfo', 'pendingRewards'];

      let userResult: [[bigint, bigint], bigint];
      if (address) {
        const userInfo = await publicClient?.multicall({
          contracts: usrInfoFunc.map((functionName) => ({
            abi: POOL_ABI,
            address: poolAddress,
            functionName: functionName,
            args: [address],
          })),
        });

        userResult = userInfo?.map((res) => res.result || null) as [[bigint, bigint], bigint];
      } else {
        userResult = [[BigInt(0), BigInt(0)], BigInt(0)];
      }

      const results = response?.map((res) => res.result || null) as [
        [bigint, bigint],
        bigint,
        [`0x${string}`, bigint, bigint, bigint],
        bigint,
        `0x${string}`,
      ];

      if (results) {
        const rewardTokenPrice = await fetchTokenPriceCoingecko(results[2][0]); // GAMBL TOKEN
        const depositTokenPrice = await fetchTokenPriceDexScreener(results[4]);
        const decimals = await publicClient?.multicall({
          contracts: [results[2][0], results[4]].map((address, index) => ({
            abi: CARTEL,
            address: address,
            functionName: 'decimals',
          })),
        });

        const depositTokenName = (await publicClient?.readContract({
          address: results[4],
          abi: CARTEL,
          functionName: 'symbol',
        })) as string;
        const rewardTokenName = (await publicClient?.readContract({
          address: results[2][0],
          abi: CARTEL,
          functionName: 'symbol',
        })) as string;

        const decimalResults = decimals?.map((res) => res.result || null) as [number, number];
        const rewardEmmisionUsd =
          Number(formatUnits(results[3] || BigInt(0), decimalResults[0])) * Number(rewardTokenPrice || 0);
        const totalStackedUSD =
          Number(formatUnits(results[1] || BigInt(0), decimalResults[1])) * Number(depositTokenPrice || 0);

        const apr =
          totalStackedUSD && rewardEmmisionUsd
            ? Math.abs(Number(((rewardEmmisionUsd * 365 * 24 * 3600) / totalStackedUSD) * 100) || 0)
            : 0;

        return {
          startTime: results[0][0] || BigInt(0),
          endTime: results[0][1] || BigInt(0),
          totalStackedAmount: results[1] || BigInt(0),
          totalStackedUSD,
          rewards: {
            tokenAddress: results[2][0],
            rewards: results[2][1] || BigInt(0),
            remainingRewards: results[2][2] || BigInt(0),
            accRewards: results[2][3] || BigInt(0),
          },
          rewardTokenPerSec: results[3] || BigInt(0),
          depositToken: results[4],
          userInfo: {
            stackedAmount: userResult[0][0] || BigInt(0),
            rewardDebt: userResult[0][1] || BigInt(0),
          },
          unclaimedReward: userResult[1] || BigInt(0),
          poolAddress,
          depositTokenName,
          rewardTokenName,
          apr,
        };
      }
      return null;
    } catch (err) {
      console.trace({ err });
      return null;
    }
  };

  const getPoolList = async () => {
    const poolAddresses = await getPoolAddresses();
    const poolDetailsPromise = poolAddresses?.map((poolAddress) => getPoolDetails({ poolAddress })) || [];
    const poolListData = await Promise.allSettled(poolDetailsPromise);
    const poolList: FarmPool[] = (
      poolListData.filter(
        (poolDetailsRes) => poolDetailsRes.status === 'fulfilled' && poolDetailsRes.value,
      ) as PromiseFulfilledResult<FarmPool>[]
    ).map((res) => res.value);
    return poolList;
  };
  return { getPoolAddresses, getPoolDetails, getPoolList };
};

export default usePoolList;
