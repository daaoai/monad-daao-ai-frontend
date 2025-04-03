import { Hex } from 'viem';

export type DaoInfo = {
  fundraisingGoal: bigint;
  totalRaised: bigint;
  goalReached: boolean;
  fundraisingFinalized: boolean;
  fundraisingDeadline: number;
  daoToken: Hex;
  paymentToken: Hex;
  isPaymentTokenNative: boolean;
};
