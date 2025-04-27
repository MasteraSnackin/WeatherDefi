import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ParametricInsuranceABI from './ParametricInsuranceABI.json';
import { PARAMETRIC_INSURANCE_ADDRESS } from './config';

// Note: This should be replaced with the imported address from config
const contractAddress = PARAMETRIC_INSURANCE_ADDRESS;

function App() {
  // State variables to manage account, contract instance, and policy details
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [policy, setPolicy] = useState<any | null>(null);

  // Effect hook to connect wallet on component mount
  useEffect(() => {
    connectWallet();
  }, []);

  // Function to connect to the wallet and initialize contract
  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access from MetaMask
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Initialize contract instance with the signer
        const contractInstance = new ethers.Contract(contractAddress, ParametricInsuranceABI, signer);
        setContract(contractInstance);

        // Fetch policy details for the connected account
        const policyDetails = await contractInstance.getPolicy(address);
        setPolicy(policyDetails);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  }

  // Function to purchase a new policy
  async function purchasePolicy() {
    if (contract) {
      try {
        const premium = ethers.utils.parseEther("0.1");
        const coverageAmount = ethers.utils.parseEther("1");
        const tx = await contract.purchasePolicy(coverageAmount, { value: premium });
        await tx.wait();
        console.log("Policy purchased successfully");
        // Fetch updated policy details
        const policyDetails = await contract.getPolicy(account);
        setPolicy(policyDetails);
      } catch (error) {
        console.error("Failed to purchase policy:", error);
      }
    }
  }

  // Render component
  return (
    <div className="App">
      <h1>Parametric Insurance dApp</h1>
      {account ? (
        <div>
          <p>Connected Account: {account}</p>
          {policy ? (
            <div>
              <h2>Your Policy</h2>
              <p>Premium: {ethers.utils.formatEther(policy.premium)} ETH</p>
              <p>Coverage: {ethers.utils.formatEther(policy.coverageAmount)} ETH</p>
              <p>Start Date: {new Date(policy.startDate.toNumber() * 1000).toLocaleString()}</p>
              <p>End Date: {new Date(policy.endDate.toNumber() * 1000).toLocaleString()}</p>
              <p>Active: {policy.active ? 'Yes' : 'No'}</p>
            </div>
          ) : (
            <button onClick={purchasePolicy}>Purchase Policy</button>
          )}
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}

export default App;
