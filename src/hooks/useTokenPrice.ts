import axios from 'axios';

const useTokenPrice = () => {
  const fetchTokenPriceDexScreener = async (address: `0x${string}`) => {
    try {
      const response = await axios.get(`https://api.dexscreener.com/token-pairs/v1/mode/${address}`);
      return response.data[0].priceUsd;
    } catch (err) {
      return null;
    }
  };
  const fetchTokenPriceCoingecko = async (address: `0x${string}`) => {
    try {
      const response = await axios.get(
        `https://api.geckoterminal.com/api/v2/simple/networks/mode/token_price/${address}`,
      );
      return response.data.data.attributes.token_prices?.[address.toLowerCase()];
    } catch (err) {
      return null;
    }
  };
  return { fetchTokenPriceDexScreener, fetchTokenPriceCoingecko };
};

export default useTokenPrice;
