'use client';

import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { DAO } from '@/daao-sdk/abi/dao';
import { daoAddress } from '@/constants/addresses';
import { requestAccounts } from '@/utils/requestAccount';

const AddToWhitelist: React.FC = () => {
  const [addresses, setAddresses] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [web3, setWeb3] = useState<Web3 | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      setWeb3(new Web3(window.ethereum));
    } else {
      setStatus('MetaMask not detected. Please install MetaMask.');
    }
  }, []);

  // Function to call `addToWhitelist`
  const handleAddToWhitelist = async () => {
    try {
      if (!web3) {
        throw new Error('Web3 is not initialized.');
      }

      setLoading(true);
      setStatus('Connecting to the blockchain...');
      const accounts = await requestAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found.');
      }

      const daosContract = new web3.eth.Contract(DAO, daoAddress);

      console.log('contracts is ', daosContract);
      const gasEstimate = await daosContract.methods.addToWhitelist(addresses).estimateGas({ from: accounts[0] });
      console.log('Gas estimation is:', gasEstimate);

      const transactionParameters = {
        from: accounts[0],
        to: daoAddress,
        data: daosContract.methods.addToWhitelist(addresses).encodeABI(),
        gas: String(gasEstimate),
        gasPrice: '800000',
      };
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

      setStatus('Addresses successfully added to the whitelist!');
      setAddresses(['']);
    } catch (error: any) {
      console.error('Error adding to whitelist:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add a new address input field
  const addAddressField = () => {
    setAddresses([...addresses, '']);
  };

  // Handle change in address fields
  const handleAddressChange = (index: number, value: string) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = value;
    setAddresses(updatedAddresses);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Add Addresses to Whitelist</h2>
      <p>Enter the addresses below and click &quot;Add to Whitelist&quot;.</p>

      {addresses.map((address, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => handleAddressChange(index, e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '5px',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
        </div>
      ))}

      <button
        onClick={addAddressField}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          borderRadius: '4px',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Add Another Address
      </button>

      <button
        onClick={handleAddToWhitelist}
        disabled={loading || addresses.some((addr) => addr.trim() === '')}
        style={{
          display: 'block',
          width: '100%',
          padding: '15px',
          borderRadius: '4px',
          background: loading ? '#ccc' : '#28a745',
          color: '#fff',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Add to Whitelist'}
      </button>

      {status && (
        <p
          style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '4px',
            background: status.includes('Error') ? '#f8d7da' : '#d4edda',
            color: status.includes('Error') ? '#721c24' : '#155724',
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default AddToWhitelist;
