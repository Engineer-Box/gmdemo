/**
 * transaction service
 */

import { factories } from "@strapi/strapi";

const isTransaction = (transaction: any) => {
  const hasProfile = typeof transaction.profile === "number";
  const hasType =
    typeof transaction.type === "string" &&
    ["in", "out", "deposit", "withdraw"].includes(transaction.type);

  return hasProfile && hasType;
};

export default factories.createCoreService(
  "api::transaction.transaction",
  ({ strapi }) => ({
    async safeBulkDelete(ids: number[]) {
      let deletedTransactions = [];

      try {
        await Promise.all(
          ids.map(async (id) => {
            const deletedTransaction = await super.delete(id, {
              populate: {
                profile: true,
                battle: true,
              },
            });

            if (deletedTransaction) {
              if (
                deletedTransaction.type === "deposit" ||
                deletedTransaction.type === "withdraw"
              ) {
                throw new Error(
                  "Cannot delete deposit or withdraw transactions",
                );
              }

              deletedTransactions.push(deletedTransaction);
            }
          }),
        );
      } catch (error) {
        // add the transactions back
        await Promise.all(
          deletedTransactions.map((transaction) => {
            // TODO: make sure to remove the tournaments once those are added
            const { id, profile, battle, ...rest } = transaction;
            strapi.service("api::transaction.transaction").create({
              data: {
                id,
                ...rest,
                profile: profile?.id,
                battle: battle?.id,
              },
            });
          }),
        );

        throw error;
      }
    },
    async safeBulkCreate(transactions: any[]) {
      let createdTransactionsIds = [];
      try {
        await Promise.all(
          transactions.map(async (transaction) => {
            if (!isTransaction(transaction)) {
              throw new Error();
            }

            const createdTransaction = await super.create({
              data: transaction,
            });
            createdTransactionsIds.push(createdTransaction.id);
          }),
        );
      } catch (error) {
        // TODO: What should we do in the case of an error here
        await Promise.all(
          createdTransactionsIds.map((transactionId) =>
            strapi
              .service("api::transaction.transaction")
              .delete(transactionId),
          ),
        );

        throw error;
      }
    },
  }),
);
