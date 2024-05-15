const { expect, use } = require("chai");
const { ethers, network, upgrades } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const TransactionType = {
  Deposit: 0,
  Withdraw: 1,
};

const deployGamerly = async () => {
  const GamerlyContractFactory = await ethers.getContractFactory("Gamerly");
  const gamerlyContract = await upgrades.deployProxy(GamerlyContractFactory, [
    process.env.NEXT_PUBLIC_USDC_SMART_CONTRACT_ADDRESS,
  ]);
  await gamerlyContract.waitForDeployment();

  const gamerlyContractAddress = await gamerlyContract.getAddress();

  return { gamerlyContract, gamerlyContractAddress };
};

const getUSDCSmartContract = async () => {
  const usdcContract = await ethers.getContractAt(
    "IERC20",
    process.env.NEXT_PUBLIC_USDC_SMART_CONTRACT_ADDRESS
  );

  return { usdcContract };
};

const addUSDCFunds = async (
  walletOrAddress,
  amount = ethers.parseUnits("1000", 6)
) => {
  const signers = await ethers.getSigners();
  const ethTransferSigner = signers[signers.length - 1];
  await helpers.setBalance(ethTransferSigner.address, ethers.parseEther("100"));
  const walletAddress = walletOrAddress?.address || walletOrAddress;

  const USDC_WHALE = "0x13134B8d770907eCb263cB88a67F9AF833007aFc";
  // Note that this wallet requires Ether
  const { usdcContract } = await getUSDCSmartContract();

  await helpers.impersonateAccount(USDC_WHALE);
  const whale = await ethers.getSigner(USDC_WHALE);

  await ethTransferSigner.sendTransaction({
    to: whale.address,
    value: ethers.parseEther("1"),
  });

  await usdcContract.connect(whale).transfer(walletAddress, amount);

  await helpers.stopImpersonatingAccount(USDC_WHALE);
};

describe("Gamerly contract", function () {
  beforeEach(async () => {
    const { url, blockNumber } = network.config.forking;
    await helpers.reset(url, blockNumber);
  });
  describe("deposit", async () => {
    it("works as expected", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const { usdcContract } = await getUSDCSmartContract();
      const [_, wallet] = await ethers.getSigners();
      await addUSDCFunds(wallet);

      usdcContract
        .connect(wallet)
        .approve(gamerlyContractAddress, ethers.parseUnits("1000", 6));

      const depositTx = await gamerlyContract.deposit(
        1,
        ethers.parseUnits("500", 6),
        wallet.address
      );

      await depositTx.wait();

      expect(await usdcContract.balanceOf(gamerlyContractAddress)).to.equal(
        ethers.parseUnits("500", 6)
      );

      expect(await gamerlyContract.getTransaction(1)).to.deep.equal([
        1,
        ethers.parseUnits("500", 6),
        wallet.address,
        TransactionType.Deposit,
      ]);
      expect(await gamerlyContract.getTransactionIds()).to.deep.equal([1]);
    });

    it("non-owner throws error", async () => {
      const { gamerlyContract } = await deployGamerly();
      const [_, wallet] = await ethers.getSigners();

      await expect(
        gamerlyContract
          .connect(wallet)
          .deposit(1, ethers.parseUnits("500", 6), wallet.address)
      ).to.be.reverted;
    });
    it("existing transaction ID throws", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const { usdcContract } = await getUSDCSmartContract();
      const [, wallet] = await ethers.getSigners();
      await addUSDCFunds(wallet);

      usdcContract
        .connect(wallet)
        .approve(gamerlyContractAddress, ethers.parseUnits("1000", 6));

      // Add the first transaction
      const transaction1 = await gamerlyContract.deposit(
        52,
        ethers.parseUnits("1", 6),
        wallet.address
      );

      await transaction1.wait();

      // Add the second with the same ID and expect it not to work
      await expect(
        gamerlyContract.deposit(
          52,
          ethers.parseUnits("50", 6),
          ethers.Wallet.createRandom().address
        )
      ).to.be.revertedWithCustomError(
        gamerlyContract,
        "TransactionIdAlreadyExists"
      );

      // Expect the original transaction to remain unchanged
      expect(await gamerlyContract.getTransaction(52)).to.deep.equal([
        52,
        ethers.parseUnits("1", 6),
        wallet.address,
        TransactionType.Deposit,
      ]);
    });

    it("insufficient allowance throws", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const [_, wallet] = await ethers.getSigners();
      await addUSDCFunds(wallet);

      // No allowance set
      await expect(
        gamerlyContract.deposit(1, ethers.parseUnits("500", 6), wallet.address)
      ).to.be.revertedWithCustomError(gamerlyContract, "InsufficientAllowance");
    });

    it("insufficient balance throws", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const { usdcContract } = await getUSDCSmartContract();
      const [_, wallet] = await ethers.getSigners();

      usdcContract
        .connect(wallet)
        .approve(gamerlyContractAddress, ethers.parseUnits("1000", 6));

      await expect(
        gamerlyContract.deposit(1, ethers.parseUnits("500", 6), wallet.address)
      ).to.be.revertedWithCustomError(gamerlyContract, "InsufficientBalance");
    });
  });
  describe("withdraw", async () => {
    it("works as expected", async () => {
      const [_, wallet] = await ethers.getSigners();
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      await addUSDCFunds(gamerlyContractAddress);
      const { usdcContract } = await getUSDCSmartContract();

      const initialWalletBalance = await usdcContract.balanceOf(wallet.address);
      const initialContractBalance = await usdcContract.balanceOf(
        gamerlyContractAddress
      );
      const withdrawTx = await gamerlyContract.withdraw(
        1,
        ethers.parseUnits("500", 6),
        wallet.address
      );

      await withdrawTx.wait();

      const finalWalletBalance = await usdcContract.balanceOf(wallet.address);
      const finalContractBalance = await usdcContract.balanceOf(
        gamerlyContractAddress
      );

      expect(initialWalletBalance).to.equal(0);
      expect(initialContractBalance).to.equal(ethers.parseUnits("1000", 6));
      expect(finalWalletBalance).to.equal(ethers.parseUnits("500", 6));
      expect(finalContractBalance).to.equal(ethers.parseUnits("500", 6));

      expect(await gamerlyContract.getTransactionIds()).to.deep.equal([1]);
      expect(await gamerlyContract.getTransaction(1)).to.deep.equal([
        1,
        ethers.parseUnits("500", 6),
        wallet.address,
        TransactionType.Withdraw,
      ]);
    });

    it("non-owner throws error", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const [_, wallet] = await ethers.getSigners();
      await addUSDCFunds(gamerlyContractAddress);

      await expect(
        gamerlyContract
          .connect(wallet)
          .withdraw(1, ethers.parseUnits("500", 6), wallet.address)
      ).to.be.reverted;
    });
    it("existing transaction ID throws", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const [owner, wallet] = await ethers.getSigners();
      await addUSDCFunds(gamerlyContractAddress);

      // Add the first transaction
      const transaction1 = await gamerlyContract.withdraw(
        32,
        ethers.parseUnits("1", 6),
        wallet.address
      );

      await transaction1.wait();

      // Add the second with the same ID and expect it not to work
      await expect(
        gamerlyContract.withdraw(
          32,
          ethers.parseUnits("50", 6),
          ethers.Wallet.createRandom().address
        )
      ).to.be.revertedWithCustomError(
        gamerlyContract,
        "TransactionIdAlreadyExists"
      );

      // Expect the original transaction to remain unchanged
      expect(await gamerlyContract.getTransaction(32)).to.deep.equal([
        32,
        ethers.parseUnits("1", 6),
        wallet.address,
        TransactionType.Withdraw,
      ]);
    });
  });
  describe("withdrawToOwner", async () => {
    it("works as expected", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const { usdcContract } = await getUSDCSmartContract();
      const [owner] = await ethers.getSigners();
      await addUSDCFunds(gamerlyContractAddress);

      const initialOwnerBalance = await usdcContract.balanceOf(owner.address);
      const initialContractBalance = await usdcContract.balanceOf(
        gamerlyContractAddress
      );

      const withdrawToOwnerTx = await gamerlyContract.withdrawToOwner(
        ethers.parseUnits("500", 6)
      );

      await withdrawToOwnerTx.wait();

      const finalOwnerBalance = await usdcContract.balanceOf(owner.address);
      const finalContractBalance = await usdcContract.balanceOf(
        gamerlyContractAddress
      );

      expect(initialOwnerBalance).to.equal(0);
      expect(initialContractBalance).to.equal(ethers.parseUnits("1000", 6));
      expect(finalOwnerBalance).to.equal(ethers.parseUnits("500", 6));
      expect(finalContractBalance).to.equal(ethers.parseUnits("500", 6));
    });
    it("non-owner throws error", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const [_, wallet] = await ethers.getSigners();
      await addUSDCFunds(gamerlyContractAddress);

      await expect(
        gamerlyContract
          .connect(wallet)
          .withdrawToOwner(ethers.parseUnits("500", 6))
      ).to.be.reverted;
    });
  });
  describe("getTransaction", async () => {
    it("non-owner throws error", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const [_, wallet] = await ethers.getSigners();

      // Add transaction
      await addUSDCFunds(gamerlyContractAddress);
      const tx = await gamerlyContract.withdraw(
        1,
        ethers.parseUnits("500", 6),
        wallet.address
      );

      await tx.wait();

      const [transactionId] = await gamerlyContract.getTransaction(1);
      expect(transactionId).to.equal(1);
      expect(await gamerlyContract.getTransaction(1)).to.deep.equal([
        1,
        ethers.parseUnits("500", 6),
        wallet.address,
        TransactionType.Withdraw,
      ]);

      await expect(gamerlyContract.connect(wallet).getTransaction(1)).to.be
        .reverted;
    });
  });
  describe("getTransactionIds", async () => {
    it("non-owner throws error", async () => {
      const { gamerlyContract, gamerlyContractAddress } = await deployGamerly();
      const [_, wallet] = await ethers.getSigners();

      // Add transaction
      await addUSDCFunds(gamerlyContractAddress);
      const tx = await gamerlyContract.withdraw(
        1,
        ethers.parseUnits("500", 6),
        wallet.address
      );

      await tx.wait();

      expect(await gamerlyContract.getTransactionIds()).to.deep.equal([1]);
      await expect(gamerlyContract.connect(wallet).getTransactionIds()).to.be
        .reverted;
    });
  });
});
