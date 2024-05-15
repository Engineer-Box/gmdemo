/**
 * transaction controller
 */

import { RequestContext, factories } from "@strapi/strapi";
import { ethers } from "ethers";
import {
  getEthersProvider,
  getGamerlyContract,
  getTransactionProps,
} from "../../../eth-utils";

const getBadRequestMessage = async (
  profileId: number,
  amount: number,
): Promise<string | null> => {
  // Must be more than 1 dollar
  if (amount <= 100 || amount % 1 !== 0) {
    return "InvalidAmount";
  }

  const pendingTransactionsForProfile = await strapi
    .service("api::transaction.transaction")
    .find({
      pagination: {
        pageSize: 1,
      },
      filters: {
        profile: profileId,
        confirmed: false,
      },
    });

  if (pendingTransactionsForProfile.results.length > 0) {
    return "AlreadyPendingTransaction";
  }

  return null;
};

export default factories.createCoreController(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async deposit(ctx) {
      const { amount } = ctx.request.body?.data || { amount: 0 };

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      const badRequestMessage = await getBadRequestMessage(profile.id, amount);

      if (badRequestMessage) {
        return ctx.badRequest(badRequestMessage);
      }

      await strapi.service("api::transaction.transaction").create({
        data: {
          amount,
          profile: profile.id,
          type: "deposit",
          confirmed: false,
        },
      });

      ctx.response.status = 200;
    },

    async withdraw(ctx) {
      const { amount } = ctx.request.body?.data || { amount: 0 };

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address);

      const badRequestMessage = await getBadRequestMessage(profile.id, amount);

      if (badRequestMessage) {
        return ctx.badRequest(badRequestMessage);
      }

      if (amount > profile.balance) {
        return ctx.badRequest("InsufficientBalance");
      }

      const dateMinusTwentyFourHours = new Date(
        Date.now() - 1000 * 60 * 60 * 24,
      ).toISOString();

      const withdrawalsInLastTwentyFourHours = await strapi
        .service("api::transaction.transaction")
        .find({
          filters: {
            profile: profile.id,
            type: "withdraw",
            createdAt: { $gt: dateMinusTwentyFourHours },
          },
          pagination: {
            pageSize: 250,
          },
        });

      const sumOfWithdrawalsInLastTwentyFourHours =
        withdrawalsInLastTwentyFourHours.results.reduce((acc, transaction) => {
          return acc + transaction.amount;
        }, 0);

      if (sumOfWithdrawalsInLastTwentyFourHours + amount > 50000) {
        return ctx.badRequest("WithdrawalLimitExceeded");
      }

      const newlyCreatedTransaction = await strapi
        .service("api::transaction.transaction")
        .create({
          data: {
            amount: amount,
            profile: profile.id,
            type: "withdraw",
            confirmed: false,
          },
        });

      try {
        const gamerlyContract = await getGamerlyContract();
        const transactionProps = await getTransactionProps();

        const tx = await gamerlyContract.withdraw(
          newlyCreatedTransaction.id,
          amount * 10000,
          ctx.state.wallet_address,
          {
            ...transactionProps,
          },
        );

        await strapi
          .service("api::transaction.transaction")
          .update(newlyCreatedTransaction.id, {
            data: {
              txHash: tx.hash,
            },
          });
      } catch (error) {
        console.log("error creating transaction", error);
      }

      ctx.response.status = 200;
    },
  }),
);
