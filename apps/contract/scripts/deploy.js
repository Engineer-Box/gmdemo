const { ethers, upgrades } = require("hardhat");

const env = process.env.NEXT_PUBLIC_APP_ENV;

// 50 000 000 000 = 50 gwei btw
// I think the contract was deployed under the wrong usdc address

async function main() {
  console.log(`Deploying to ${env}...`);
  console.log(
    process.env.NEXT_PUBLIC_USDC_SMART_CONTRACT_ADDRESS,
    process.env.NEXT_PUBLIC_APP_ENV
  );

  //0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
  const GamerlyContractFactory = await ethers.getContractFactory("Gamerly");

  const gamerlyContract = await upgrades.deployProxy(GamerlyContractFactory, [
    "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  ]);

  console.log("Waiting...", gamerlyContract);
  await gamerlyContract.waitForDeployment();

  const gamerlyContractAddress = await gamerlyContract.getAddress();

  // TODO: Get and store the ABI somewhere
  console.log(
    `Deployment to ${env} complete`,
    gamerlyContractAddress,
    gamerlyContract
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
