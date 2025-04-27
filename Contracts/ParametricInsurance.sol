// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./generated/interfaces/verification/IJsonApiVerification.sol";
import "./generated/implementation/verification/JsonApiVerification.sol";

// Struct to store weather data
struct Weather {
    int256 latitude;
    int256 longitude;
    int256 temperature;  // In Kelvin * 1e6 (e.g., 293.15K = 293150000)
    int256 windSpeed;
    uint256 windDeg;
    uint256 timestamp;
    string[] description;
}

contract ParametricInsurance {
    // Array to store active policyholder addresses
    address[] public policyholders;
    
    // Interface for JSON API verification
    IJsonApiVerification public immutable jsonApiAttestationVerification;
    
    // Mapping to store policies for each policyholder
    mapping(address => Policy) public policies;
    
    // Struct to represent an insurance policy
    struct Policy {
        uint256 premium;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        bool active;
    }
    
    // Events for logging policy purchases and claim payments
    event PolicyPurchased(address indexed policyholder, uint256 premium, uint256 coverageAmount);
    event ClaimPaid(address indexed policyholder, uint256 amount);
    event WeatherDataAdded(int256 temperature, uint256 timestamp);

    // Temperature threshold for claim payout (0°C = 273.15K * 1e6)
    int256 public constant TEMPERATURE_THRESHOLD = 273150000;

    // Address of the contract owner
    address public owner;

    constructor() {
        // Initialize the JSON API verification contract
        jsonApiAttestationVerification = new JsonApiVerification();
        owner = msg.sender;
    }

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // Function to purchase a new insurance policy
    function purchasePolicy(uint256 _coverageAmount) public payable {
        require(msg.value > 0, "Premium must be greater than 0");
        require(_coverageAmount > 0, "Coverage amount must be greater than 0");
        require(!policies[msg.sender].active, "Policy already exists");

        // Create a new policy for the sender
        policies[msg.sender] = Policy({
            premium: msg.value,
            coverageAmount: _coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + 30 days,
            active: true
        });

        // Add policyholder to the array of active policyholders
        policyholders.push(msg.sender);

        emit PolicyPurchased(msg.sender, msg.value, _coverageAmount);
    }

    // Function to add new weather data and process claims
    function addWeatherData(IJsonApi.Response calldata jsonResponse) public onlyOwner {
        IJsonApi.Proof memory proof = IJsonApi.Proof({
            merkleProof: new bytes32[](0),
            data: jsonResponse
        });

        // Verify the JSON API response
        require(
            jsonApiAttestationVerification.verifyJsonApi(proof),
            "Invalid proof"
        );

        // Decode the weather data from the response
        Weather memory newWeather = abi.decode(
            jsonResponse.responseBody.abi_encoded_data,
            (Weather)
        );

        emit WeatherDataAdded(newWeather.temperature, newWeather.timestamp);

        // Check and process claims based on the new weather data
        checkAndProcessClaims(newWeather);
    }

    // Internal function to check and process claims based on weather data
    function checkAndProcessClaims(Weather memory _weather) internal {
        // Check if the temperature is below the threshold
        if (_weather.temperature < TEMPERATURE_THRESHOLD) {
            for (uint i = 0; i < policyholders.length; i++) {
                address policyholder = policyholders[i];
                Policy storage policy = policies[policyholder];
                
                // Check if the policy is active and the weather event is within the policy period
                if (policy.active && _weather.timestamp >= policy.startDate && _weather.timestamp <= policy.endDate) {
                    uint256 payoutAmount = policy.coverageAmount;
                    policy.active = false;
                    
                    // Remove policyholder from the active list
                    policyholders[i] = policyholders[policyholders.length - 1];
                    policyholders.pop();
                    
                    // Emit event before transfer to prevent reentrancy
                    emit ClaimPaid(policyholder, payoutAmount);
                    
                    // Transfer the payout to the policyholder
                    (bool success, ) = payable(policyholder).call{value: payoutAmount}("");
                    require(success, "Transfer failed");
                    
                    // Decrement i to recheck the swapped policyholder
                    i--;
                }
            }
        }
    }

    // Function to retrieve policy details for a given policyholder
    function getPolicy(address _policyholder) public view returns (Policy memory) {
        return policies[_policyholder];
    }
}
