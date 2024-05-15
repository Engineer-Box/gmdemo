import { ethers } from "ethers";
import {
  getEthersProvider,
  getGamerlyContract,
  getTransactionProps,
} from "./eth-utils";

const setCreatedSince = async () => {
  const provider = await getEthersProvider();
  const blockNumber = await provider.getBlockNumber();

  console.log(
    "--------------------- setCreatedSince start ------------------------",
  );
  const transactionsToSetExistsSince = await strapi
    .service("api::transaction.transaction")
    .find({
      filters: {
        confirmed: false,
        type: ["deposit", "withdraw"],
        createdSinceBlockNumber: { $null: true },
      },
      pagination: {
        pageSize: 1,
      },
    });

  console.log(transactionsToSetExistsSince);

  await Promise.all(
    transactionsToSetExistsSince.results.map(async (result) => {
      await strapi.service("api::transaction.transaction").update(result.id, {
        data: {
          createdSinceBlockNumber: blockNumber,
        },
      });
    }),
  );

  console.log(
    "--------------------- setCreatedSince ended ------------------------",
  );
};

const createTransactions = async () => {
  console.log(
    "--------------------- createTransactions started ------------------------",
  );
  const gamerlyContract = await getGamerlyContract();
  const depositTransactionsToCreate = await strapi
    .service("api::transaction.transaction")
    .find({
      filters: {
        type: "deposit",
        confirmed: false,
        txHash: { $null: true },
        onChainSinceBlockNumber: { $null: true },
      },
      populate: {
        profile: true,
      },
      pagination: {
        pageSize: 250,
      },
    });

  console.log("to create", depositTransactionsToCreate);

  await Promise.all(
    depositTransactionsToCreate.results.map(async (result) => {
      try {
        const transactionProps = await getTransactionProps();
        console.log("transaction props", transactionProps);

        const tx = await gamerlyContract.deposit(
          result.id,
          result.amount * 10000,
          result.profile.wallet_address,
          {
            ...transactionProps,
          },
        );

        console.log("created tx", tx);

        await strapi.service("api::transaction.transaction").update(result.id, {
          data: {
            txHash: tx.hash,
          },
        });
      } catch (error) {
        console.log("error creating deposit transaction", error);
      }
    }),
  );
  console.log(
    "--------------------- createTransactions ended ------------------------",
  );
};

const confirmTransactions = async () => {
  console.log(
    "--------------------- confirmTransactions started ------------------------",
  );
  const provider = await getEthersProvider();
  const blockNumber = await provider.getBlockNumber();
  const REQUIRED_CONFIRMATIONS = 30;

  const unconfirmedTransactionsToConfirm = await strapi
    .service("api::transaction.transaction")
    .find({
      filters: {
        confirmed: false,
        type: ["deposit", "withdraw"],
        txHash: { $ne: null },
        onChainSinceBlockNumber: { $null: true },
        createdSinceBlockNumber: {
          $lte: blockNumber - REQUIRED_CONFIRMATIONS,
        },
      },
      pagination: {
        pageSize: 1,
      },
    });
  console.log("unconfirmed transactions", unconfirmedTransactionsToConfirm);

  await Promise.all(
    unconfirmedTransactionsToConfirm.results.map(async (result) => {
      const receipt = await provider.getTransactionReceipt(result.txHash);

      console.log("receipt", receipt);

      if (receipt && receipt.confirmations > REQUIRED_CONFIRMATIONS) {
        const didSucceed = receipt.status === 1;

        if (didSucceed) {
          console.log("transaction succeeded");
          await strapi
            .service("api::transaction.transaction")
            .update(result.id, {
              data: {
                confirmed: true,
              },
            });
        } else {
          console.log("transaction failed, deleting");
          await strapi
            .service("api::transaction.transaction")
            .delete(result.id);
        }
      }
    }),
  );

  // Those not using transaction hashes
  const transactionsWithoutHashes = await strapi
    .service("api::transaction.transaction")
    .find({
      filters: {
        confirmed: false,
        type: ["deposit", "withdraw"],
        txHash: { $null: true },
        onChainSinceBlockNumber: {
          $lte: blockNumber - (REQUIRED_CONFIRMATIONS + 30),
        },
      },
      pagination: {
        pageSize: 1,
      },
    });

  console.log("transactions without hashes", transactionsWithoutHashes);
  await Promise.all(
    transactionsWithoutHashes.results.map(async (result) => {
      await strapi.service("api::transaction.transaction").update(result.id, {
        data: {
          confirmed: true,
        },
      });
    }),
  );

  console.log(
    "--------------------- confirmTransactions ended ------------------------",
  );
};

const deleteTransactions = async () => {
  console.log(
    "--------------------- deleteTransactions started ------------------------",
  );
  const provider = await getEthersProvider();
  const blockNumber = await provider.getBlockNumber();
  const gamerlyContract = await getGamerlyContract();

  const transactionsToDelete = await strapi
    .service("api::transaction.transaction")
    .find({
      filters: {
        confirmed: false,
        type: ["deposit", "withdraw"],
        onChainSinceBlockNumber: {
          $null: true,
        },
        createdSinceBlockNumber: {
          // This translates to about 15 minutes
          $lte: blockNumber - 450,
        },
      },
      pagination: {
        pageSize: 1,
      },
    });

  console.log("transactions to delete", transactionsToDelete);

  await Promise.all(
    // Before deleting the transaction, check that it doesn't exist on chain
    transactionsToDelete.results.map(async (result) => {
      const getTransactionResult = await gamerlyContract.getTransaction(
        result.id,
      );

      console.log("getTransactionResult", getTransactionResult);

      if (getTransactionResult?.id?.gte(1)) {
        const { amount, profileAddress, transactionType } =
          getTransactionResult;
        console.log(amount, profileAddress, transactionType);
        const profile = await strapi
          .service("api::profile.profile")
          .findOneByWalletAddress(profileAddress);

        console.log(profile);
        await strapi.service("api::transaction.transaction").update(result.id, {
          data: {
            onChainSinceBlockNumber: blockNumber,
            type: transactionType === 0 ? "deposit" : "withdraw",
            profile: profile.id,
            amount: amount.div(10000).toNumber(),
          },
        });
      } else {
        await strapi.service("api::transaction.transaction").delete(result.id);
      }
    }),
  );

  console.log(
    "--------------------- deleteTransactions ended ------------------------",
  );
};

export const processTransactions = async () => {
  await setCreatedSince();
  await createTransactions();
  await confirmTransactions();
  await deleteTransactions();
};

// Old implementation

// export const oldprocessTransactions = async (currentBlockNumber: number) => {
//   const unconfirmedTransactions = await strapi
//     .service("api::transaction.transaction")
//     .find({
//       filters: {
//         confirmed: false,
//       },
//       pagination: {
//         pageSize: 1,
//       },
//     });

//   if (unconfirmedTransactions.results.length === 0) {
//     return;
//   }
//   // Transaction creation
//   const gasLimit = ethers.BigNumber.from(500000);
//   const gamerlyContract = await getGamerlyContract();
//   const requiredConfirmations = {
//     allowance: isDev ? 1 : isStage ? 5 : 10,
//     transaction: isDev ? 2 : isStage ? 10 : 40,
//     deletion: isDev ? 3 : isStage ? 20 : 50,
//   };

//   console.log("----- creating transactions -----");
//   const depositTransactionsToCreate = await strapi
//     .service("api::transaction.transaction")
//     .find({
//       filters: {
//         type: "deposit",
//         confirmed: false,
//         txHash: { $null: true },
//         onChainSinceBlockNumber: { $null: true },
//         allowanceTxBlockNumber: {
//           $lte: currentBlockNumber - requiredConfirmations.allowance,
//         },
//       },
//       populate: {
//         profile: true,
//       },
//       pagination: {
//         pageSize: 250,
//       },
//     });
//   console.log(
//     "deposit transactions to create",
//     depositTransactionsToCreate.results,
//   );

//   await Promise.all(
//     depositTransactionsToCreate.results.map(async (result) => {
//       try {

//         const tx = await (
//           await gamerlyContract.deposit(
//             result.id,
//             result.amount * 10000,
//             result.profile.wallet_address,
//             {
//               gasLimit,
//             },
//           )
//         ).wait();

//         await strapi.service("api::transaction.transaction").update(result.id, {
//           data: {
//             txHash: tx.transactionHash,
//             txBlockNumber: tx.blockNumber,
//           },
//         });
//       } catch (error) {
//         console.log("error creating deposit transaction", error);
//       }
//     }),
//   );

//   console.log("----- confirming transactions -----");

//   // Transaction confirmation
//   const transactionsToConfirm = await strapi
//     .service("api::transaction.transaction")
//     .find({
//       pagination: {
//         pageSize: 250,
//       },
//       populate: {
//         profile: true,
//       },
//       filters: {
//         confirmed: false,
//         type: ["deposit", "withdraw"],
//         $or: [
//           {
//             txBlockNumber: {
//               $lte: currentBlockNumber - requiredConfirmations.transaction,
//             },
//           },
//           {
//             onChainSinceBlockNumber: {
//               $lte: currentBlockNumber - requiredConfirmations.transaction,
//             },
//           },
//         ],
//       },
//     });

//   console.log("transactions to confirm", transactionsToConfirm.results);

//   await Promise.all(
//     transactionsToConfirm.results.map(async (result) => {
//       try {
//         // Note that we don't need to check the receipt here because if the transaction is on the blockchain after X confirmations we know it's valid
//         const onChainTransaction = await gamerlyContract.getTransaction(
//           result.id,
//         );

//         if (onChainTransaction) {
//           const { amount, profileAddress, transactionType } =
//             onChainTransaction;

//           const transactionTypeMatches =
//             result.type === "deposit"
//               ? transactionType === 0
//               : transactionType === 1;

//           const amountMatches =
//             ethers.BigNumber.isBigNumber(amount) &&
//             amount.eq(result.amount * 10000);

//           const profileMatches =
//             profileAddress.toLowerCase() ===
//             result.profile.wallet_address.toLowerCase();

//           await strapi
//             .service("api::transaction.transaction")
//             .update(result.id, {
//               data: {
//                 confirmed: true,
//               },
//             });

//           console.log(
//             "should confirm transaction",
//             transactionTypeMatches,
//             amountMatches,
//             profileMatches,
//           );
//           if (transactionTypeMatches && amountMatches && profileMatches) {
//             await strapi
//               .service("api::transaction.transaction")
//               .update(result.id, {
//                 data: {
//                   confirmed: true,
//                 },
//               });
//           }
//         }
//       } catch (error) {
//         console.log("error confirming transaction", error);
//       }
//     }),
//   );
//   console.log("----- deleting transactions -----");
//   // Transaction deletion
//   const transactionsToDelete = await strapi
//     .service("api::transaction.transaction")
//     .find({
//       pagination: {
//         pageSize: 250,
//       },
//       filters: {
//         confirmed: false,
//         $or: [
//           {
//             txHash: { $null: true },
//             txBlockNumber: { $null: true },
//             onChainSinceBlockNumber: { $null: true },
//             allowanceTxBlockNumber: {
//               $lte: currentBlockNumber - requiredConfirmations.deletion,
//             },
//           },
//           {
//             txBlockNumber: {
//               $lte: currentBlockNumber - requiredConfirmations.deletion,
//             },
//           },
//           {
//             onChainSinceBlockNumber: {
//               $lte: currentBlockNumber - requiredConfirmations.deletion,
//             },
//           },
//         ],
//       },
//     });

//   console.log("transactions to delete", transactionsToDelete.results);

//   await Promise.all(
//     transactionsToDelete.results.map(async (result) => {
//       const gamerlyContract = await getGamerlyContract();
//       const onChainTransaction = await gamerlyContract.getTransaction(
//         result.id,
//       );

//       if (!onChainTransaction) {
//         console.log(
//           "about to delete a transaction",
//           result,
//           onChainTransaction,
//         );
//         await strapi.service("api::transaction.transaction").delete(result.id);
//       } else {
//         console.log(
//           "cannot delete - updating on chain since block number and setting the props",
//           result.id,
//         );
//         const { amount, profileAddress, transactionType } = onChainTransaction;
//         console.log(amount, profileAddress, transactionType);
//         const profile = await strapi
//           .service("api::profile.profile")
//           .findOneByWalletAddress(profileAddress);

//         // TODO: Start doing this validation in the confirm block instead
//         console.log({
//           onChainSinceBlockNumber: currentBlockNumber,
//           transactionType: transactionType === 0 ? "deposit" : "withdraw",
//           profile: profile.id,
//           amount: amount.div(10000).toNumber(),
//         });
//         const res = await strapi
//           .service("api::transaction.transaction")
//           .update(result.id, {
//             data: {
//               onChainSinceBlockNumber: currentBlockNumber,
//               type: transactionType === 0 ? "deposit" : "withdraw",
//               profile: profile.id,
//               amount: amount.div(10000).toNumber(),
//             },
//           });

//         console.log("res", res);
//       }
//     }),
//   );
// };
