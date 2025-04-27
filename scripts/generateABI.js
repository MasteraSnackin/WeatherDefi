// Import required Node.js modules
const fs = require('fs');  // File system module for reading and writing files
const path = require('path');  // Path module for handling file paths

// Define the path to the contracts directory
// __dirname is the directory of the current script
// '..' moves up one directory level to the project root
const contractsDir = path.join(__dirname, '..', 'artifacts', 'contracts');

// Define the path to the ParametricInsurance contract directory
const parametricInsuranceDir = path.join(contractsDir, 'ParametricInsurance.sol');

// Define the path to the ParametricInsurance.json file
// This file contains the compiled contract data, including the ABI
const parametricInsuranceFile = path.join(parametricInsuranceDir, 'ParametricInsurance.json');

// Import the contract JSON file
// require() reads and parses the JSON file
const contractJson = require(parametricInsuranceFile);

// Extract the ABI from the contract JSON
// The ABI (Application Binary Interface) defines how to interact with the contract
const abi = contractJson.abi;

// Define the output path for the ABI file
// This will be in the src directory of the project
const abiOutputPath = path.join(__dirname, '..', 'src', 'ParametricInsuranceABI.json');

// Write the ABI to the output file
// JSON.stringify(abi, null, 2) converts the ABI to a formatted JSON string
// The '2' argument adds indentation for readability
fs.writeFileSync(abiOutputPath, JSON.stringify(abi, null, 2));

// Log a success message
console.log(`ABI file generated at ${abiOutputPath}`);
