export interface Token {
  address: string;
  circulating_market_cap: number | null;
  decimals: string;
  exchange_rate: number | null;
  holders: string;
  icon_url: string | null;
  name: string;
  symbol: string;
  total_supply: string;
  type: string;
  volume_24h: number | null;
}
export interface TokenBalance {
  token: Token;
  token_id: string | null;
  token_instance: string | null;
  value: string;
}
export type ApiResponse = TokenBalance[];

// DEXScreener API types
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative: string;
  txns: {
    h24: {
      buys: number;
      sells: number;
    };
  };
}

export interface DexScreenerResponse {
  pairs: DexScreenerPair[];
}

// Combined token data with price
export interface TokenWithPrice extends TokenBalance {
  priceUsd?: string;
}

export type EnhancedApiResponse = TokenWithPrice[];

export type Asset = {
  token: string;
  // tokenIcon?: string
  balance: number;
  price: number;
  totalValue: number;
};
