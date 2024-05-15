import { errors } from "@strapi/utils";
import { resolveRelationIdForHookData } from "../../../../util";
const { ApplicationError } = errors;

// TODO: Allow these to fail without causing errors as they are not critical

export default {
  beforeDeleteMany() {
    throw new ApplicationError("Cannot delete many transactions");
  },
  beforeUpdateMany() {
    throw new ApplicationError("Cannot update many transactions");
  },

  async beforeCreate({ params }) {
    const { type, amount } = params?.data ?? {};

    if (type === "withdraw" || type === "out") {
      const balance = await strapi
        .service("api::profile.profile")
        .getBalanceForProfile(
          resolveRelationIdForHookData(params.data.profile),
        );

      if (balance < amount) {
        throw new ApplicationError("Insufficient funds");
      }
    }
  },
  async beforeUpdate({
    params: {
      data,
      where: { id },
    },
  }) {
    // TODO: Need to make sure this logic isn't used for already IN | OUT transactions
    const initialTransaction = await strapi
      .service("api::transaction.transaction")
      .findOne(id, { populate: { profile: true } });

    const initialConfirmValue = initialTransaction?.confirmed;
    const finalConfirmValue = data.confirmed ?? initialConfirmValue;

    const transactionWasConfirmed =
      initialConfirmValue === false && finalConfirmValue === true;

    if (transactionWasConfirmed) {
      await strapi.service("api::notification.notification").create({
        data: {
          type: "TRANSACTION_RESULT",
          profile: initialTransaction.profile.id,
          transaction_result_details: {
            didFail: false,
            type: initialTransaction.type,
            amount: initialTransaction.amount,
          },
        },
      });
    }
  },

  async beforeDelete({
    state,
    params: {
      where: { id },
    },
  }) {
    const transactionToDelete = await strapi
      .service("api::transaction.transaction")
      .findOne(id, { populate: { profile: true } });

    state.profileId = transactionToDelete.profile?.id;
  },
  async afterDelete({ result, state }) {
    if (!state.profileId) return;
    await strapi.service("api::notification.notification").create({
      data: {
        type: "TRANSACTION_RESULT",
        profile: state.profileId,
        transaction_result_details: {
          didFail: true,
          type: result.type,
          amount: result.amount,
        },
      },
    });
  },
};
