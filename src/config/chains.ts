import { wmonTokenAddress } from '@/constants/addresses';
import { supportedChainIds } from '@/constants/chains';
import { ChainsConfig } from '@/types/chains';
import { parseUnits } from 'viem';

export const chainsData: {
  [key: number]: ChainsConfig;
} = {
  [supportedChainIds.monad]: {
    id: supportedChainIds.monad,
    name: 'Monad Testnet',
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorer: 'testnet.monadexplorer.com',
    contribution: {
      token: {
        address: '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
        decimals: 18,
        symbol: "MON",
        name: "Monad"
      },
      minAmount: BigInt(0),
      maxAmount: parseUnits('0.1', 18),
    },
    daoAddress: '0x61d4B36dC50Fd637f162f2cd1667e6F0FC2Fb9Da',
    nativeCurrency: {
      name: 'Testnet MON Token',
      symbol: 'MON',
      decimals: 18,
    },
    dexInfo: {
      type: 'uniswap',
      factoryAddress: '0xC201EA874E80fDaf67EEDf6ffB957F84FbB61468',
      swapRouterAddress: '0xC201EA874E80fDaf67EEDf6ffB957F84FbB61468',
      quoterAddress: '0xC201EA874E80fDaf67EEDf6ffB957F84FbB61468',
    },
  },
  [supportedChainIds.bsc]: {
    id: supportedChainIds.bsc,
    name: 'Binance Smart Chain',
    rpcUrls: ['https://56.rpc.thirdweb.com'],
    blockExplorer: 'bscscan.com',
    contribution: {
      token: {
        address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
        decimals: 18,
        symbol: 'CAKE',
        name: 'CAKE',
      },
      minAmount: BigInt(0),
      maxAmount: parseUnits('1', 18),
    },
    daoAddress: '0x273cfA50190358639ea7ab3e6bF9c91252132338',
    nativeCurrency: {
      name: 'BNB Token',
      symbol: 'BNB',
      decimals: 18,
    },
    dexInfo: {
      type: 'pancake',
      factoryAddress: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
      swapRouterAddress: '0x88E564D3cFf40d99C76e43434Ce293B6f545F024',
      quoterAddress: '0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997',
    },
  },
};
