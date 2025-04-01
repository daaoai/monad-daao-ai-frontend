export const VELO_FACTORY_ABI = [
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_swapFeeManager',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_unstakedFeeManager',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_voter',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_poolImplementation',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_gaugeFactory',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_nft',
          type: 'address',
        },
        {
          internalType: 'address',
          name: '_recipient',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint24',
          name: 'oldUnstakedFee',
          type: 'uint24',
        },
        {
          indexed: true,
          internalType: 'uint24',
          name: 'newUnstakedFee',
          type: 'uint24',
        },
      ],
      name: 'DefaultUnstakedFeeChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnerChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'token0',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'token1',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'int24',
          name: 'tickSpacing',
          type: 'int24',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      name: 'PoolCreated',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldFeeManager',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newFeeManager',
          type: 'address',
        },
      ],
      name: 'SwapFeeManagerChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldFeeModule',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newFeeModule',
          type: 'address',
        },
      ],
      name: 'SwapFeeModuleChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'int24',
          name: 'tickSpacing',
          type: 'int24',
        },
        {
          indexed: true,
          internalType: 'uint24',
          name: 'fee',
          type: 'uint24',
        },
      ],
      name: 'TickSpacingEnabled',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldFeeManager',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newFeeManager',
          type: 'address',
        },
      ],
      name: 'UnstakedFeeManagerChanged',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'oldFeeModule',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newFeeModule',
          type: 'address',
        },
      ],
      name: 'UnstakedFeeModuleChanged',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      name: 'allPools',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'allPoolsLength',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'tokenA',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'tokenB',
          type: 'address',
        },
        {
          internalType: 'int24',
          name: 'tickSpacing',
          type: 'int24',
        },
        {
          internalType: 'uint160',
          name: 'sqrtPriceX96',
          type: 'uint160',
        },
      ],
      name: 'createPool',
      outputs: [
        {
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'tokenA',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'tokenB',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'tickSpacing',
          type: 'uint24',
        },
      ],
      name: 'createPool',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'defaultUnstakedFee',
      outputs: [
        {
          internalType: 'uint24',
          name: '',
          type: 'uint24',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'int24',
          name: 'tickSpacing',
          type: 'int24',
        },
        {
          internalType: 'uint24',
          name: 'fee',
          type: 'uint24',
        },
      ],
      name: 'enableTickSpacing',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'gaugeFactory',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'tokenA',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'tokenB',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'tickSpacing',
          type: 'uint24',
        },
      ],
      name: 'getPool',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'tokenA',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'tokenB',
          type: 'address',
        },
        {
          internalType: 'uint24',
          name: 'tickSpacing',
          type: 'uint24',
        },
      ],
      name: 'getPool',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      name: 'getSwapFee',
      outputs: [
        {
          internalType: 'uint24',
          name: '',
          type: 'uint24',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      name: 'getUnstakedFee',
      outputs: [
        {
          internalType: 'uint24',
          name: '',
          type: 'uint24',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      name: 'isPair',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'pool',
          type: 'address',
        },
      ],
      name: 'isPool',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'nft',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'poolImplementation',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint24',
          name: '_defaultUnstakedFee',
          type: 'uint24',
        },
      ],
      name: 'setDefaultUnstakedFee',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_owner',
          type: 'address',
        },
      ],
      name: 'setOwner',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_swapFeeManager',
          type: 'address',
        },
      ],
      name: 'setSwapFeeManager',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_swapFeeModule',
          type: 'address',
        },
      ],
      name: 'setSwapFeeModule',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_unstakedFeeManager',
          type: 'address',
        },
      ],
      name: 'setUnstakedFeeManager',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_unstakedFeeModule',
          type: 'address',
        },
      ],
      name: 'setUnstakedFeeModule',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'sfs',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'swapFeeManager',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'swapFeeModule',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'int24',
          name: '',
          type: 'int24',
        },
      ],
      name: 'tickSpacingToFee',
      outputs: [
        {
          internalType: 'uint24',
          name: '',
          type: 'uint24',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'tickSpacings',
      outputs: [
        {
          internalType: 'int24[]',
          name: '',
          type: 'int24[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'tokenId',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'unstakedFeeManager',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'unstakedFeeModule',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'voter',
      outputs: [
        {
          internalType: 'contract IVoter',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];