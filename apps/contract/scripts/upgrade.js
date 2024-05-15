const { ethers, upgrades } = require("hardhat");

const env = process.env.NEXT_PUBLIC_APP_ENV;

async function main() {
  const GamerlyContractFactory = await ethers.getContractFactory("Gamerly");
  const gamerlyContract = await upgrades.upgradeProxy(
    "0x383b58464421ab80C9460a0Fc77d0b26142865F6", // the constant address of the contract
    GamerlyContractFactory
  );

  console.log("Waiting...");
  await gamerlyContract.waitForDeployment();

  const gamerlyContractAddress = await gamerlyContract.getAddress();
  console.log("Gamerly upgraded", gamerlyContractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
