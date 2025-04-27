// Import the contract address from a JSON file
import contractAddressFile from '../contractAddress.json';

// Define the structure of the contractAddress file
// This interface ensures type safety when working with the imported JSON
interface ContractAddressFile {
  address: string;
}

// Type assertion to ensure the imported file matches the expected structure
// This cast doesn't perform runtime checks, it's only for TypeScript's type system
const contractAddress = contractAddressFile as ContractAddressFile;

// Check if the address exists
// This runtime check ensures that the required data is present in the JSON file
if (!contractAddress.address) {
  throw new Error('Contract address is not defined in contractAddress.json');
}

// Export the contract address as a constant
// This makes the address available for use in other parts of the application
export const PARAMETRIC_INSURANCE_ADDRESS = contractAddress.address;

// Example of environment-specific addresses
// Uncomment and modify this section if you need different addresses for different environments
// export const PARAMETRIC_INSURANCE_ADDRESS = 
//   process.env.NODE_ENV === 'production'
//     ? contractAddress.productionAddress
//     : contractAddress.developmentAddress;
