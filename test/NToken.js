const { expect } = require("chai");
const hre = require("hardhat");

describe("NToken contract", function () {
  // global vars
  let Token;
  let NToken;
  let owner;
  let addr1;
  let addr2;
  let tokenCap = 100000000;
  let tokenBlockReward = 50;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Token = await ethers.getContractFactory("NToken");
    [owner, addr1, addr2] = await hre.ethers.getSigners();

    NToken = await Token.deploy(tokenCap, tokenBlockReward);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await NToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await NToken.balanceOf(owner.address);
      expect(await NToken.totalSupply()).to.equal(ownerBalance);
    });

    describe("Transactions", function () {
      it("Should transfer tokens between accounts", async function () {
        // Transfer 50 tokens from owner to addr1
        await NToken.transfer(addr1.address, 50);
        const addr1Balance = await NToken.balanceOf(addr1.address);
        expect(addr1Balance).to.equal(50);

        // Transfer 50 tokens from addr1 to addr2
        // We use .connect(signer) to send a transaction from another account
        await NToken.connect(addr1).transfer(addr2.address, 50);
        const addr2Balance = await NToken.balanceOf(addr2.address);
        expect(addr2Balance).to.equal(50);
      });

      it("Should fail if sender doesn't have enough tokens", async function () {
        const initialOwnerBalance = await NToken.balanceOf(owner.address);
        // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
        // `require` will evaluate false and revert the transaction.
        await expect(
          NToken.connect(addr1).transfer(owner.address, 1)
        ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

        // Owner balance shouldn't have changed.
        expect(await NToken.balanceOf(owner.address)).to.equal(
          initialOwnerBalance
        );
      });
    });
  });
});
