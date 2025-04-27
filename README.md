# WeatherShield DeFi - Parametric Insurance dApp

A blockchain-based solution for automated weather risk protection using Ethereum smart contracts and external data oracles. Provides instant payouts when predefined weather conditions are met.

[Live Demo](https://mythic-narrative-weathershield.gptengineer.run/) • [Smart Contract](contracts/ParametricInsurance.sol)

## Key Features
- **Parametric Triggers**: Policies execute automatically when weather thresholds (e.g., rainfall <1mm/72h) are met
- **Multi-Oracle Verification**: Aggregates data from multiple sources to ensure accuracy
- **Collateralized Reserves**: Fully-funded contracts using Chainlink Price Feeds for ETH/USD conversions
- **Non-Custodial**: Users retain control of funds until claim conditions are verified

## Technical Architecture

<>


## Project Structure
| Path | Description | 
|------|-------------|
| `contracts/` | Solidity smart contracts |
| &nbsp;&nbsp;├── `ParametricInsurance.sol` | Main insurance logic |
| &nbsp;&nbsp;└── `InsurancePool.sol` | Collateral management |
| `src/` | React frontend |
| &nbsp;&nbsp;├── `components/` | UI widgets |
| &nbsp;&nbsp;└── `utils/` | Blockchain interactions |
| `test/` | Hardhat test suite |
| `scripts/` | Deployment & utility scripts |

## Development Setup

### Prerequisites
- Node.js 18.x
- Hardhat 2.18+
- MetaMask with Sepolia testnet ETH

Install dependencies
npm install

Compile contracts
npx hardhat compile

Run test suite
npx hardhat test test/ParametricInsurance.test.ts

Deploy to testnet
npx hardhat run scripts/deploy.ts --network sepolia


## Contract Parameters
struct Policy {
uint256 premium;
uint256 payoutAmount;
uint256 startDate;
uint256 duration;
uint256 rainfallThreshold; // in mm
address oracleAddress;
}


## Key Technologies
| Component | Implementation |
|-----------|----------------|
| Blockchain | Ethereum, Flare Network |
| Oracles | Chainlink Data Feeds[4] |
| Frontend | React + TypeScript |
| Testing | Hardhat + Chai |
| CI/CD | GitHub Actions |

## Usage Flow
1. **Policy Creation**  
   Users define parameters through UI:

   await contract.createPolicy(
100000000, // 0.1 ETH premium
1000, // $1000 payout
172800, // 72-hour window
10 // <10mm rainfall threshold
);


2. **Oracle Reporting**  
Chainlink nodes submit verified weather data[4]
3. **Claim Processing**  
Automatic payout if conditions met:


function checkClaim(uint256 policyId) public {
if (currentRainfall < policies[policyId].threshold) {
payout(policyId);
}
}

## Security Features
- Multi-signature oracle responses
- Time-locked parameter changes
- Fund separation between policy pools
- Comprehensive unit tests (90% coverage)

## License
Apache 2.0

