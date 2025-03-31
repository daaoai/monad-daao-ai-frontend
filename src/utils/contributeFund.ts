import Web3 from 'web3';
import { CONTRACT_ABI } from '../daao-sdk/abi/abi';
import { ERC_20_ABI } from '../daao-sdk/abi/erc20';
import { daoAddress, wmonTokenAddress } from '@/constants/addresses';

let web3: Web3 | null = null;

//Contribute to Dao
export const handleContribute = async (amount: string) => {
  if (!window.ethereum) {
    throw new Error('No Ethereum provider found.');
  }
  if (!web3) {
    web3 = new Web3(window.ethereum);
  }

  try {
    console.log('Connecting to the blockchain...');

    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      throw new Error('No connected accounts found. Please connect your wallet.');
    }

    const contributor = accounts[0];
    console.log('Preparing transaction for account:', contributor);

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    console.log('Converting amount to wei:', weiAmount);

    const daosContract = new web3.eth.Contract(CONTRACT_ABI as any, daoAddress);
    console.log('Contract object created:', daosContract);

    const contributedAmountYetRaw = await daosContract.methods.contributions(contributor).call();
    const contributedAmountYet = Number(contributedAmountYetRaw) / 10 ** 18;

    const userTiers = await daosContract.methods.getWhitelistInfo(contributor).call();

    if (!userTiers || typeof userTiers !== 'object' || !('tier' in userTiers)) {
      console.log('Error: Invalid userTiers response', userTiers);
      return 0;
    }

    const tierNumber = Number(userTiers.tier);

    const tierLimit = await daosContract.methods.tierLimits(Number(tierNumber)).call();
    const maxLimit = Number(tierLimit) / 10 ** 18;
    if (Number(amount) + contributedAmountYet > maxLimit) {
      console.log('Amount exceeds tier limit');
      return 4;
    }

    if (Number(amount) > maxLimit) {
      console.log('Amount exceeds tier limit');
      return 0;
    }

    const tokenContract = new web3.eth.Contract(ERC_20_ABI as any, wmonTokenAddress);

    const currentAllowanceRaw = await tokenContract.methods.allowance(contributor, daoAddress).call();
    console.log('Current allowance raw:', Number(currentAllowanceRaw));
    const currentAllowance = Number(currentAllowanceRaw);
    console.log('Current allowance:', currentAllowance);

    if (currentAllowance < Number(weiAmount)) {
      console.log('Insufficient allowance. Approving required tokens...');
      const requiredApproval = weiAmount;

      const gasEstimate = await tokenContract.methods.approve(daoAddress, requiredApproval).estimateGas({
        from: contributor,
      });
      const approveTx = {
        from: contributor,
        to: wmonTokenAddress,
        data: tokenContract.methods.approve(daoAddress, requiredApproval).encodeABI(),
        gas: String(gasEstimate),
        gasPrice: '800000',
      };

      const approveTxHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [approveTx],
      });

      console.log('Waiting for approval transaction to be mined...');
      let approvalReceipt = null;
      while (approvalReceipt === null) {
        approvalReceipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [approveTxHash],
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      console.log('Approval Successful!', approvalReceipt);
    } else {
      console.log('Approval already sufficient, skipping...');
    }
    console.log('Estimating gas for contribution...');
    console.log('Contribution amount:', weiAmount);
    let gasEstimate;
    try {
      gasEstimate = await daosContract.methods.contribute(weiAmount).estimateGas({
        from: contributor,
      });
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return 1;
    }
    console.log('Estimated Gas:', gasEstimate);

    console.log('Sending transaction...');
    const transactionParameters = {
      from: accounts[0],
      to: daoAddress,

      data: daosContract.methods.contribute(weiAmount).encodeABI(),
      gas: String(gasEstimate),
      gasPrice: '800000',
    };

    console.log('Transaction result:', transactionParameters);

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    let receipt = null;
    while (receipt === null) {
      receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });
      console.log(receipt);
      console.log('Waiting for transaction to be mined...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    console.log('Transaction Receipt:', receipt);
    console.log('Contribution successful!');

    return 5;
  } catch (error: any) {
    console.error('Error during contribution:', error);
    console.log('error is ', error);
    return error;
  }
};
