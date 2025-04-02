import { Hex } from 'viem';

export type DaoInfo = {
  fundraisingGoal: number;
  totalRaised: number;
  goalReached: boolean;
  fundraisingFinalized: boolean;
  fundraisingDeadline: number;
  daoToken: Hex;
  paymentToken: Hex;
  isPaymentTokenNative: boolean;
};
