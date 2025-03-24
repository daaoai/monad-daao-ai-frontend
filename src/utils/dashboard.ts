import { Asset, EnhancedApiResponse } from '@/types/dashboard';

export const formatDaoHoldingTokens = (daoTokens: EnhancedApiResponse): Asset[] => {
  return daoTokens
    .filter((item) => item.token.symbol !== 'CARTELTEST')
    .map((item) => {
      const decimals = Number(item.token.decimals);
      const balance = Number(item.value) / Math.pow(10, decimals);
      const price = item.priceUsd ? Number(item.priceUsd) : 0;
      return {
        token: item.token.symbol,
        // tokenIcon: item.token.icon_url ?? "",
        balance,
        price,
        totalValue: price * balance,
      };
    });
};
