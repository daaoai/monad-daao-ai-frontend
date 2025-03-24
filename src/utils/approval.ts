import { StatusCodes, TxnStatus } from '@/constants/txn';
import { Abi } from 'viem';

export const handleViemTransactionError = ({ error }: { abi: Abi; error: any }) => {
  if (error?.code === StatusCodes.WalletRPCFailure || error?.cause?.code === StatusCodes.WalletRPCFailure) {
    return {
      error,
      errorMsg: 'Too many requests, failure on user wallet',
      code: StatusCodes.WalletRPCFailure,
      status: TxnStatus.error,
    };
  }
  if (error?.code === StatusCodes.UserRejectedRequest || error?.cause?.code === StatusCodes.UserRejectedRequest) {
    return {
      error,
      errorMsg: 'Rejected by User',
      code: StatusCodes.UserRejectedRequest,
      status: TxnStatus.rejected,
    };
  }
  return {
    status: TxnStatus.error,
    error,
    errorMsg: 'Approval Failed',
    code: StatusCodes.ContractExecutionError,
  };
};
