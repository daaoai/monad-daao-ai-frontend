export const ROUTER_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'pool',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'zeroForOne',
        type: 'bool',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amountSpecified',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint160',
        name: 'sqrtPriceLimitX96',
        type: 'uint160',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount0Delta',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'amount1Delta',
        type: 'int256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'outputAmount',
        type: 'uint256',
      },
    ],
    name: 'SwapExecuted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'VELODROM_FACTORY',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'pool', type: 'address' },
      { internalType: 'bool', name: 'zeroForOne', type: 'bool' },
      { internalType: 'int256', name: 'amountSpecified', type: 'int256' },
      {
        internalType: 'uint160',
        name: 'sqrtPriceLimitX96',
        type: 'uint160',
      },
      {
        internalType: 'uint256',
        name: 'minimumOutputAmount',
        type: 'uint256',
      },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    name: 'getSwapResult',
    outputs: [
      { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
      { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
      { internalType: 'uint160', name: 'nextSqrtRatio', type: 'uint160' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'int256', name: 'amount0Delta', type: 'int256' },
      { internalType: 'int256', name: 'amount1Delta', type: 'int256' },
      { internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'uniswapV3SwapCallback',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
