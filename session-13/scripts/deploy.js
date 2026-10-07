/*
  Run with:
  npx hardhat run scripts/deploy.js --network sepolia
*/

import { network } from "hardhat";

const { ethers } = await network.create();

const SEPOLIA_ETH_USD_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

const factory = await ethers.deployContract("BrickShareFactory", [SEPOLIA_ETH_USD_FEED]);
await factory.waitForDeployment();

const usdPricePerToken = ethers.parseUnits("1000", 18);
const transaction = await factory.createProperty(
  "Marina Gate Residences",
  "MGR",
  usdPricePerToken,
  11000n,
);
const receipt = await transaction.wait();
const createdEvent = receipt.logs
  .map((log) => {
    try {
      return factory.interface.parseLog(log);
    } catch {
      return null;
    }
  })
  .find((event) => event?.name === "PropertyCreated");

console.log("BrickShareFactory deployed at:", await factory.getAddress());
console.log("PropertyToken deployed at:", createdEvent.args.token);
