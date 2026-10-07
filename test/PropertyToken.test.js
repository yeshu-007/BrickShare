import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("PropertyToken", function () {
  async function deployFixture() {
    const [owner, investor, secondInvestor, outsider] = await ethers.getSigners();
    const token = await ethers.deployContract("PropertyToken", [
      "Marina Gate Residences",
      "MGR",
      owner.address,
      1000n,
      100n,
    ]);
    await token.setVerified(investor.address, true);
    await token.setVerified(secondInvestor.address, true);
    return { token, owner, investor, secondInvestor, outsider };
  }

  it("allows a verified investor to buy within the cap", async function () {
    const { token, investor } = await deployFixture();

    await expect(token.connect(investor).buy(10n, { value: 10000n }))
      .to.emit(token, "TokensPurchased")
      .withArgs(investor.address, 10n, 10000n);
    expect(await token.balanceOf(investor.address)).to.equal(10n);
  });

  it("allows a verified investor to transfer to another verified investor", async function () {
    const { token, investor, secondInvestor } = await deployFixture();
    await token.connect(investor).buy(10n, { value: 10000n });

    await token.connect(investor).transfer(secondInvestor.address, 4n);
    expect(await token.balanceOf(secondInvestor.address)).to.equal(4n);
  });

  it("allows the owner to whitelist, pause, resume, and withdraw", async function () {
    const { token, owner, outsider } = await deployFixture();

    await expect(token.setVerified(outsider.address, true))
      .to.emit(token, "VerificationUpdated")
      .withArgs(outsider.address, true);
    await expect(token.setSaleActive(false)).to.emit(token, "SaleStatusChanged").withArgs(false);
    await expect(token.setSaleActive(true)).to.emit(token, "SaleStatusChanged").withArgs(true);

    await owner.sendTransaction({ to: await token.getAddress(), value: 5000n });
    await expect(token.withdraw()).to.emit(token, "Withdrawn").withArgs(owner.address, 5000n);
    expect(await ethers.provider.getBalance(await token.getAddress())).to.equal(0n);
  });

  it("rejects an unverified buyer", async function () {
    const { token, outsider } = await deployFixture();

    await expect(token.connect(outsider).buy(1n, { value: 1000n }))
      .to.be.revertedWithCustomError(token, "NotVerified")
      .withArgs(outsider.address);
  });

  it("rejects transfers to an unverified recipient", async function () {
    const { token, investor, outsider } = await deployFixture();
    await token.connect(investor).buy(1n, { value: 1000n });

    await expect(token.connect(investor).transfer(outsider.address, 1n))
      .to.be.revertedWithCustomError(token, "NotVerified")
      .withArgs(outsider.address);
  });

  it("rejects privileged actions by a non-owner", async function () {
    const { token, outsider } = await deployFixture();
    const ownableError = "OwnableUnauthorizedAccount";

    await expect(token.connect(outsider).setVerified(outsider.address, true))
      .to.be.revertedWithCustomError(token, ownableError).withArgs(outsider.address);
    await expect(token.connect(outsider).setSaleActive(false))
      .to.be.revertedWithCustomError(token, ownableError).withArgs(outsider.address);
    await expect(token.connect(outsider).withdraw())
      .to.be.revertedWithCustomError(token, ownableError).withArgs(outsider.address);
  });

  it("rejects a purchase beyond the supply cap", async function () {
    const { token, investor } = await deployFixture();

    await expect(token.connect(investor).buy(101n, { value: 101000n }))
      .to.be.revertedWithCustomError(token, "SupplyCapExceeded");
  });

  it("rejects a purchase with incorrect payment", async function () {
    const { token, investor } = await deployFixture();

    await expect(token.connect(investor).buy(2n, { value: 1000n }))
      .to.be.revertedWithCustomError(token, "IncorrectPayment");
  });

  it("rejects purchases while the sale is inactive", async function () {
    const { token, investor } = await deployFixture();
    await token.setSaleActive(false);

    await expect(token.connect(investor).buy(1n, { value: 1000n }))
      .to.be.revertedWithCustomError(token, "SaleNotActive");
  });
});
