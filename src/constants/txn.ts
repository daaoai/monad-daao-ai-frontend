export enum StatusCodes {
  UserRejectedRequest = 4001,
  Success = 200,
  FunctionNotFound = 32771, // 0x8003
  Error = 500, // @TODO update as per need
  WalletRPCFailure = 429,
  SimulationFailure = 417,
  ContractExecutionError = -500,
}

export enum TxnStatus {
  mining = 'mining',
  success = 'success',
  rejected = 'rejected',
  error = 'error',
  reverted = 'reverted',
  pendingWalletConfirmation = 'pendingWalletConfirmation',
  partialSuccess = 'partialSuccess',
}
