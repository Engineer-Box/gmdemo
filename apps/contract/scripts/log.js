const hre = require("hardhat");

async function main() {
  const num = {
    _hex: "0x1b9a",
    _isBigNumber: true,
  };

  console.log(hre.ethers.bn);
  console.log(hre.ethers.bigNumber);
  console.log(hre.ethers.bignumber);
  console.log(hre.ethers.BigNumber);
  return;
  const gamerlyContract = await hre.ethers.getContractAt(
    "Gamerly",
    "0xFD296cCDB97C605bfdE514e9810eA05f421DEBc2"
  );

  console.log(await gamerlyContract.getTransaction(7056));
  console.log(await gamerlyContract.getTransactionIds());

  try {
    const t = await gamerlyContract.deposit(
      1,
      "0x70997970c51812dc3a010c7d01b50e0d17dc79c8",
      50
    );
  } catch (error) {
    console.log(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
