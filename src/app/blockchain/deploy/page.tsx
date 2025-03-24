'use client';

import React, { useState } from 'react';
import Web3 from 'web3';
import { DAO } from '@/daao-sdk/abi/dao';
import { DaoBytecode } from '@/daao-sdk/bytecode/daoByteCode';

const DeployDAO: React.FC = () => {
  const [daoName, setDaoName] = useState<string>('');
  const [daoSymbol, setDaoSymbol] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const deployContracts = async () => {
    if (!daoName || !daoSymbol || !tokenName || !tokenSymbol) {
      alert('All fields are required');
      return;
    }
    const web3 = new Web3(window.ethereum);
    async function requestAccounts() {
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

    try {
      const accounts = await requestAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setStatus('Deploying contracts...');

      const Daocontract = new web3.eth.Contract(DAO);
      console.log(tokenName, tokenSymbol);
      const fundraisingGoal = web3.utils.toWei('100', 'ether');
      const maxWhitelistAmount = web3.utils.toWei('10', 'ether');
      const maxPublicContributionAmount = web3.utils.toWei('20', 'ether');
      const fundraisingDeadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      const fundExpiry = fundraisingDeadline + 30 * 24 * 60 * 60;
      const liquidityLockerFactory = '0x003dedB033F4b7705418a82F7513471070f6BF53';
      const protocolAdmin = accounts[0];

      const deployTx = Daocontract.deploy({
        data: DaoBytecode,
        arguments: [
          fundraisingGoal,
          tokenName,
          tokenSymbol,
          fundraisingDeadline,
          fundExpiry,
          protocolAdmin,
          liquidityLockerFactory,
          maxWhitelistAmount,
          protocolAdmin,
          maxPublicContributionAmount,
        ],
      });
      console.log('deploytx is ', deployTx);

      const gasEstimate = await deployTx.estimateGas({
        from: accounts[0],
      });
      console.log('gass is ', gasEstimate);

      const deployedContract = await deployTx.send({
        from: accounts[0],
        gas: gasEstimate.toString(),
      });

      console.log('deployed contracts is ', deployedContract);
    } catch (error) {
      console.error(error);
      setStatus('Error deploying contracts. Check console for details.');
    }
  };

  return (
    <div>
      <h1>Deploy DAO</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          deployContracts();
        }}
      >
        <input
          type="text"
          placeholder="DAO Name"
          value={daoName}
          onChange={(e) => setDaoName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="DAO Symbol"
          value={daoSymbol}
          onChange={(e) => setDaoSymbol(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Token Name"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Token Symbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          required
        />
        <button type="submit">Deploy</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default DeployDAO;
