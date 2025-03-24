import axios from 'axios';
import { Hex } from 'viem';

const useAvailableTokens = () => {
  const fetchAvailableTokens = async (address: Hex) => {
    try {
      const response = await axios.get(
        `https://explorer-mode-mainnet-0.t.conduit.xyz/api/v2/addresses/${address}/token-balances`,
      );
      return response;
    } catch (err) {
      console.log('error is ', err);
      return null;
    }
  };
  return { fetchAvailableTokens };
};

export default useAvailableTokens;
