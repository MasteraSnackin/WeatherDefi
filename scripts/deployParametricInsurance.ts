import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";
import fs from 'fs';
import path from 'path';

let PARAMETRIC_INSURANCE_ADDRESS: string;

const contractAddressPath = path.join(__dirname, '..', 'contractAddress.json');

if (fs.existsSync(contractAddressPath)) {
  const contractAddressFile = JSON.parse(fs.readFileSync(contractAddressPath, 'utf8'));
  if (contractAddressFile.address) {
    PARAMETRIC_INSURANCE_ADDRESS = contractAddressFile.address;
  } else {
    throw new Error('Contract address is not defined in contractAddress.json');
  }
} else {
  console.warn('contractAddress.json not found. Using placeholder address.');
  PARAMETRIC_INSURANCE_ADDRESS = '0x0000000000000000000000000000000000000000';
}

export { PARAMETRIC_INSURANCE_ADDRESS };

// URL for the verifier server that prepares attestation data
const VERIFIER_SERVER_URL = "http://localhost:3000/IJsonApi/prepareResponse";
// API key for OpenWeatherMap, stored in .env file
const { OPEN_WEATHER_API_KEY } = process.env;

// Function to fetch attestation data from the verifier server
async function getAttestationData(timestamp: number): Promise<any> {
  try {
    const response = await fetch(VERIFIER_SERVER_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.VERIFIER_API_KEY || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "attestationType": "0x4a736f6e41706900000000000000000000000000000000000000000000000000",
        "sourceId": "0x5745423200000000000000000000000000000000000000000000000000000000",
        "messageIntegrityCode": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "requestBody": {
          "url": `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=39.099724&lon=-94.578331&dt=${timestamp}&appid=${OPEN_WEATHER_API_KEY}`,
          "postprocessJq": "{latitude:(.lat*pow(10;6)),longitude:(.lon*pow(10;6)),temperature:(.data[0].temp*pow(10;6)),wind_speed:(.data[0].wind_speed*pow(10;6)),wind_deg:.data[0].wind_deg,timestamp:.data[0].dt,description:[.data[0].weather[].description]}",
          "abi_signature": "{\"struct Weather\":{\"latitude\":\"int256\",\"longitude\":\"int256\",\"temperature\":\"uint256\",\"wind_speed\":\"uint256\",\"wind_deg\":\"uint256\",\"timestamp\":\"uint256\",\"description\":\"string[]\"}}"
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching attestation data:", error);
    throw new Error("Failed to fetch attestation data. Please check your network connection and try again.");
  }
}

async function main() {
  // Get the contract factory for ParametricInsurance
  const ParametricInsurance = await ethers.getContractFactory("ParametricInsurance");
  
  // Deploy the contract
  console.log("Deploying ParametricInsurance...");
  const parametricInsurance = await ParametricInsurance.deploy();
  
  // Wait for the contract to be deployed
  await parametricInsurance.waitForDeployment();
  
  // Get the deployed contract address
  const contractAddress = await parametricInsurance.getAddress();
  console.log("ParametricInsurance deployed to:", contractAddress);

  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  
  // Set up policy details
  const premium = ethers.parseEther("0.1");  // 0.1 ETH
  const coverageAmount = ethers.parseEther("1");  // 1 ETH
  
  // Purchase a policy
  console.log("Purchasing policy...");
  const purchaseTx = await parametricInsurance.purchasePolicy(coverageAmount, { value: premium });
  await purchaseTx.wait();
  console.log("Policy purchased for:", deployer.address);

  // Get current timestamp
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Fetch attestation data
  console.log("Fetching attestation data...");
  const attestationData = await getAttestationData(timestamp);
  
  // Add weather data to the contract
  console.log("Adding weather data...");
  const weatherTx = await parametricInsurance.addWeatherData(attestationData.response);
  await weatherTx.wait();
  console.log("Weather data added");

  // Verify the contract on Etherscan if API key is available
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (e: any) {
      console.log("Verification failed:", e.message);
    }
  } else {
    console.log("Skipping Etherscan verification due to missing API key");
  }
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
