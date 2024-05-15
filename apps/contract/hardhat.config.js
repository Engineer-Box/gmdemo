/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-chai-matchers");
require("hardhat-gas-reporter");

const getEnvFileName = () => {
  const env = process.env.NEXT_PUBLIC_APP_ENV;

  if (!env || env === "development") {
    return ".env";
  }

  return `.${env}.env`;
};

require("dotenv").config({
  path: `../../${getEnvFileName()}`,
});

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.20",
  gasReporter: {
    enabled: true,
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
        interval: 2000,
      },
      forking: {
        enabled: true,
        url: `https://eth-mainnet.g.alchemy.com/v2/enterkey`,
        blockNumber: 18912483,
      },
    },
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.GAMERLY_SMART_CONTRACT_OWNER_PRIVATE_KEY],
    },
    polygon: {
      url: "https://polygon-mainnet.infura.io/v3/d4f99fdbae184086af441c205388eefd",
      accounts: [
        "0fca060f3af4d16948318130a5ee281c5c32a53fa991ebafb631c1e3f978cf5d",
      ],
      // accounts: [
      //   "0xe8897898f2cfbae761da88f550165e2817f25a54e16339d198a482e847981176",
      // ],
      gasPrice: 500000000000,
    },
  },
};
