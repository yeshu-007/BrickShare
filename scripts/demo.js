/*
  Local Hardhat demo:
  npx hardhat build
  npx hardhat run scripts/demo.js

  This creates a fresh in-memory chain each time, so it does not use Sepolia,
  MetaMask, old deployment addresses, or real ETH.
*/

import { network } from "hardhat";

const { ethers } = await network.create();

function errorSummary(error) {
  return error.shortMessage || error.message?.split("\n")[0] || "transaction reverted";
}

const [owner, investor, secondInvestor, unverified] = await ethers.getSigners();

console.log("\n=== BrickShare Hardhat demo ===");
console.log("Owner:", owner.address);
console.log("Investor:", investor.address);
console.log("Second investor:", secondInvestor.address);

const mockFeed = await ethers.deployContract("MockV3Aggregator", [8, 2000n * 10n ** 8n]);
await mockFeed.waitForDeployment();

const factory = await ethers.deployContract("BrickShareFactory", [await mockFeed.getAddress()]);
await factory.waitForDeployment();

console.log("\nFactory deployed:", await factory.getAddress());
console.log("Normalized ETH/USD:", (await factory.getLatestEthUsdPrice()).toString());

const createTx = await factory.createProperty(
  "Marina Gate Demo Property",
  "MGP",
  1n * 10n ** 18n,
  100n,
);
await createTx.wait();

const properties = await factory.getDeployedProperties();
const tokenAddress = properties[properties.length - 1];
const token = await ethers.getContractAt("PropertyToken", tokenAddress);

console.log("PropertyToken deployed:", tokenAddress);
console.log("Fixed price per token (wei):", (await token.pricePerToken()).toString());
console.log("Supply cap:", (await token.totalSupplyCap()).toString());

await (await token.setVerified(investor.address, true)).wait();
await (await token.setVerified(secondInvestor.address, true)).wait();
console.log("\nInvestor verified:", await token.isVerified(investor.address));

const price = await token.pricePerToken();
await (await token.connect(investor).buy(2n, { value: price * 2n })).wait();
console.log("Investor balance after purchase:", (await token.balanceOf(investor.address)).toString());
console.log("Total supply after purchase:", (await token.totalSupply()).toString());

await (await token.connect(investor).transfer(secondInvestor.address, 1n)).wait();
console.log("Second investor balance after transfer:", (await token.balanceOf(secondInvestor.address)).toString());

try {
  await token.connect(unverified).buy(1n, { value: price });
  console.log("Unexpected: unverified purchase succeeded");
} catch (error) {
  console.log("Expected unverified purchase failure:", errorSummary(error));
}

try {
  await token.connect(investor).buy(1n, { value: 1n });
  console.log("Unexpected: incorrect payment succeeded");
} catch (error) {
  console.log("Expected incorrect-payment failure:", errorSummary(error));
}

await (await token.setSaleActive(false)).wait();
console.log("\nSale active after pause:", await token.saleActive());

try {
  await token.connect(investor).buy(1n, { value: price });
  console.log("Unexpected: purchase while paused succeeded");
} catch (error) {
  console.log("Expected paused-sale failure:", errorSummary(error));
}

await (await token.setSaleActive(true)).wait();
console.log("Sale active after resume:", await token.saleActive());

try {
  await token.connect(investor).setSaleActive(false);
  console.log("Unexpected: non-owner changed sale status");
} catch (error) {
  console.log("Expected non-owner failure:", errorSummary(error));
}

await (await token.withdraw()).wait();
console.log("\nOwner withdrawal completed.");
console.log("Final total supply:", (await token.totalSupply()).toString());
console.log("=== Demo complete ===\n");
