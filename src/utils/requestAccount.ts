// requestAccount.ts
import Web3 from 'web3';

export async function requestAccounts(): Promise<string[]> {
  const web3 = new Web3(window.ethereum);

  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return await web3.eth.getAccounts();
    } catch (error) {
      console.error('User denied account access:', error);
      throw error;
    }
  } else {
    console.error('No Ethereum provider detected.');
    throw new Error('No Ethereum provider detected.');
  }
}
