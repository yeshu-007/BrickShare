import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("BrickShareFactory", function () {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const mockFeed = await ethers.deployContract("MockV3Aggregator", [8, 2000n * 10n ** 8n]);
    const factory = await ethers.deployContract("BrickShareFactory", [await mockFeed.getAddress()]);
    return { owner, other, mockFeed, factory };
  }

  it("creates a property with the correct fixed price and registry entry", async function () {
    const { factory } = await deployFixture();
    const usdPrice = 1000n * 10n ** 18n;
    const expectedEthPrice = 500000000000000000n;

    await expect(factory.createProperty("Marina Gate Residences", "MGR", usdPrice, 11000n))
      .to.emit(factory, "PropertyCreated")
      .withArgs((value) => value !== ethers.ZeroAddress, "Marina Gate Residences", expectedEthPrice, 11000n);

    const properties = await factory.getDeployedProperties();
    expect(properties).to.have.lengthOf(1);
    expect(await factory.isPropertyToken(properties[0])).to.equal(true);
    expect(await factory.getLatestEthUsdPrice()).to.equal(2000n * 10n ** 18n);
  });

  it("rejects property creation by a non-owner", async function () {
    const { factory, other } = await deployFixture();

    await expect(
      factory.connect(other).createProperty("Unauthorized", "BAD", 1000n * 10n ** 18n, 100n),
    ).to.be.revertedWithCustomError(factory, "OwnableUnauthorizedAccount").withArgs(other.address);
  });
});
