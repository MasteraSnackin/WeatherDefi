import { expect } from "chai";
import { ethers } from "hardhat";
import { ParametricInsurance } from "../typechain-types";

// Test suite for the ParametricInsurance contract
describe("ParametricInsurance", function () {
  let parametricInsurance: ParametricInsurance;

  // Before each test, deploy a new instance of the contract
  beforeEach(async function () {
    const ParametricInsurance = await ethers.getContractFactory("ParametricInsurance");
    parametricInsurance = await ParametricInsurance.deploy();
    await parametricInsurance.deployed();
  });

  // Test case: Purchasing a policy
  it("Should allow purchasing a policy", async function () {
    // Get the first signer (owner) from the list of signers
    const [owner] = await ethers.getSigners();
    
    // Set up test values for premium and coverage amount
    const premium = ethers.utils.parseEther("0.1");  // 0.1 ETH
    const coverageAmount = ethers.utils.parseEther("1");  // 1 ETH

    // Expect the purchasePolicy function to emit a PolicyPurchased event
    // with the correct arguments
    await expect(parametricInsurance.purchasePolicy(coverageAmount, { value: premium }))
      .to.emit(parametricInsurance, "PolicyPurchased")
      .withArgs(owner.address, premium, coverageAmount);

    // Fetch the policy details and verify they are correct
    const policy = await parametricInsurance.getPolicy(owner.address);
    expect(policy.premium).to.equal(premium);
    expect(policy.coverageAmount).to.equal(coverageAmount);
    expect(policy.active).to.be.true;
  });

  // Placeholder for additional tests
  // Add more tests here
});
