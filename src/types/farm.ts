import { Address, Hex } from 'viem';

export interface PoolRewards {
  tokenAddress: string;
  rewards: bigint;
  remainingRewards: bigint;
  accRewards: bigint;
}

export interface UserInfo {
  stackedAmount: bigint;
  rewardDebt: bigint;
}

export interface FarmPool {
  startTime: bigint;
  endTime: bigint;
  totalStackedAmount: bigint;
  totalStackedUSD: number;
  rewards: PoolRewards;
  rewardTokenPerSec: bigint;
  depositToken: Hex;
  poolAddress: Hex;
  userInfo: UserInfo;
  unclaimedReward: bigint;
  apr: number;
  depositTokenName: string;
  rewardTokenName: string;
}

export interface Position {
  nonce: bigint;
  operator: Address;
  token0: Address;
  token1: Address;
  tickSpacing: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  liquidityUsd: string;
  id: number;
  apr: number;
  rewardInfo: bigint;
  numberOfStakes: number;
}
