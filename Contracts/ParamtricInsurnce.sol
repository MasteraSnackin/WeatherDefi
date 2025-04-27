// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./generated/interfaces/verification/IJsonApiVerification.sol";
import "./generated/implementation/verification/JsonApiVerification.sol";

struct Weather {
    int256 latitude;
    int256 longitude;
    int256 temperature;
    int256 windSpeed;
    uint256 windDeg;
    uint256 timestamp;
    string[] description;
}

contract ParametricInsurance {
    Weather[] public weatherData;
    IJsonApiVerification public jsonApiAttestationVerification;
    mapping(address => Policy) public policies;
    address[] public policyholders;
    
    struct Policy {
        uint256 premium;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        bool active;
    }
    
    event PolicyPurchased(address indexed policyholder, uint256 premium, uint256 coverageAmount);
    event ClaimPaid(address indexed policyholder, uint256 amount);

    constructor() {
        jsonApiAttestationVerification = new JsonApiVerification();
    }

    function purchasePolicy(uint256 _coverageAmount) public payable {
        require(msg.value > 0, "Premium must be greater than 0");
        require(_coverageAmount > 0, "Coverage amount must be greater than 0");
        require(!policies[msg.sender].active, "Policy already exists");

        policies[msg.sender] = Policy({
            premium: msg.value,
            coverageAmount: _coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + 30 days,
            active: true
        });

        emit PolicyPurchased(msg.sender, msg.value, _coverageAmount);
    }

    function addWeatherData(IJsonApi.Response calldata jsonResponse) public {
        IJsonApi.Proof memory proof = IJsonApi.Proof({
            merkleProof: new bytes32[](0),
            data: jsonResponse
        });

        require(
            jsonApiAttestationVerification.verifyJsonApi(proof),
            "Invalid proof"
        );

        Weather memory newWeather = abi.decode(
            jsonResponse.responseBody.abi_encoded_data,
            (Weather)
        );

        weatherData.push(newWeather);

        checkAndProcessClaims(newWeather);
    }

    function checkAndProcessClaims(Weather memory _weather) internal {
        if (_weather.temperature < 273150000) {
            for (uint i = 0; i < policyholders.length; i++) {
                address policyholder = policyholders[i];
                Policy storage policy = policies[policyholder];
                
                if (policy.active && _weather.timestamp >= policy.startDate && _weather.timestamp <= policy.endDate) {
                    uint256 payoutAmount = policy.coverageAmount;
                    policy.active = false;
                    payable(policyholder).transfer(payoutAmount);
                    emit ClaimPaid(policyholder, payoutAmount);
                    
                    // Remove policyholder from the list
                    policyholders[i] = policyholders[policyholders.length - 1];
                    policyholders.pop();
                    i--;
                }
            }
        }
    }

    function getPolicy(address _policyholder) public view returns (Policy memory) {
        return policies[_policyholder];
    }
}
