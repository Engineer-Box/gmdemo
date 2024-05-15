const { ethers, network } = require("hardhat");

const env = process.env.NEXT_PUBLIC_APP_ENV;

if (env !== "development") {
  console.log("This script is only for development");
  process.exitCode = 1;
}

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_WHALE = "0x13134B8d770907eCb263cB88a67F9AF833007aFc";
const RECEIVER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

async function main() {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [USDC_WHALE],
  });

  const whale = await ethers.getSigner(USDC_WHALE);

  const usdc = await ethers.getContractAt("IERC20", USDC);

  const attacker = await ethers.getSigner(RECEIVER);

  const USDC_AMOUNT = ethers.parseUnits("100000", 6);

  let whaleBal = await usdc.balanceOf(USDC_WHALE);
  let attackerBal = await usdc.balanceOf(attacker.address);

  console.log(
    "Initial USDC balance of whale : ",
    ethers.formatUnits(whaleBal, 6)
  );

  console.log(
    "Initial USDC balance of attacker : ",
    attacker.address,
    ethers.formatUnits(attackerBal, 6)
  );

  await attacker.sendTransaction({
    to: whale.address,
    value: ethers.parseEther("50.0"),
  });

  await usdc.connect(whale).transfer(attacker.address, USDC_AMOUNT);

  let newWhaleBal = await usdc.balanceOf(USDC_WHALE);
  let newAttackerBal = await usdc.balanceOf(attacker.address);

  console.log(
    "Final USDC balance of whale : ",
    ethers.formatUnits(newWhaleBal, 6)
  );

  console.log(
    "Final USDC balance of attacker : ",
    ethers.formatUnits(newAttackerBal, 6)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
