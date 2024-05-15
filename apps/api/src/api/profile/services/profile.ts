/**
 * profile service
 */

import { factories } from "@strapi/strapi";
import merge from "deepmerge";

/**
 * 
 * @param profileIdOrProfileIds 
 * @returns 
   [
     {
       amount: number, // meaningless
       confirmedBalance: number, // the sum of all confirmed transaction amounts
       type: "withdraw", // we group by transaction type
       profileId: 1, // we group by profile ID too
     },
     {
       amount: number,
       confirmedBalance: number,
       type: "in",
       profileId: 1,
     },
     {
       amount: number, // meaningless
       confirmedBalance: number, // the sum of all confirmed transaction amounts
       type: "withdraw", // we group by transaction type
       profileId: 2, // we group by profile ID too
     },
   ];
 */
const getSumOfTransactionsByTypeAndProfileId = async (
  profileIdOrProfileIds: number | number[],
) => {
  const knex = strapi.db.connection;
  const isMultipleProfiles = Array.isArray(profileIdOrProfileIds);

  /**
   * - Join the transaction with the profiles they are for
   * - Select the profile Id and the transaction type
   * - Group by the type
   * - Filter by the profile IDs
   */
  const query = knex("transactions")
    .join(
      "transactions_profile_links",
      "transactions.id",
      "=",
      "transactions_profile_links.transaction_id",
    )
    .select(
      "transactions.type",
      "transactions_profile_links.profile_id as profileId",
    )
    .where(function () {
      this.where({ confirmed: true }).orWhere({ type: "withdraw" });
    })
    .sum("transactions.amount as confirmedBalance")
    .groupBy("transactions.type");

  if (isMultipleProfiles) {
    query.groupBy("profileId");
    query.whereIn(
      "transactions_profile_links.profile_id",
      profileIdOrProfileIds,
    );
  } else {
    query.andWhere(
      "transactions_profile_links.profile_id",
      profileIdOrProfileIds,
    );
  }

  return await query;
};

const calculateBalanceForProfile = (
  profileId: number,
  sumOfTransactionsByType: any[],
) => {
  const transactionsForProfile = sumOfTransactionsByType.filter(
    (t) => t.profileId === profileId,
  );

  const withdrawSum =
    transactionsForProfile.find(({ type }) => type === "withdraw")
      ?.confirmedBalance ?? 0;

  const depositSum =
    transactionsForProfile.find(({ type }) => type === "deposit")
      ?.confirmedBalance ?? 0;

  const outSome =
    transactionsForProfile.find(({ type }) => type === "out")
      ?.confirmedBalance ?? 0;

  const inSum =
    transactionsForProfile.find(({ type }) => type === "in")
      ?.confirmedBalance ?? 0;

  const totalBalance = depositSum + inSum - (withdrawSum + outSome);

  return totalBalance;
};

export default factories.createCoreService("api::profile.profile", {
  async findOneWithVouchAndLeaderboardStats(
    profileId: number,
    params: any = {},
  ) {
    const mergedParams = merge(params, {
      populate: {
        vouched_by: true,
      },
    });
    const profile = await super.findOne(profileId, mergedParams);

    if (!profile) return null;
    // TODO: We're going to want convert this to raw SQL for performance
    // https://docs.strapi.io/dev-docs/api/query-engine/bulk-operations#count
    profile.vouch_count = await profile.vouched_by?.length;

    profile.leaderboard_item_stats = await strapi
      .service("api::leaderboard.leaderboard")
      .getAllTimeLeaderboardItemStats("profile", profileId);

    return profile;
  },
  async getVouchCount(profileId: number) {
    const profileWithVouches = await super.findOne(profileId, {
      populate: {
        vouched_by: true,
      },
    });

    return profileWithVouches.vouched_by?.length ?? 0;
  },
  async findOneByWalletAddress(walletAddress, params: any = {}) {
    const mergedParams = merge(params, {
      filters: {
        wallet_address: walletAddress,
      },
    });
    const { results: profileResults } = await strapi
      .service("api::profile.profile")
      .find(mergedParams);

    const profile = profileResults[0];

    return profile;
  },

  async getBalanceForProfile(profileId: number): Promise<number> {
    const transactionSums =
      await getSumOfTransactionsByTypeAndProfileId(profileId);
    const totalBalance = calculateBalanceForProfile(profileId, transactionSums);

    return totalBalance;
  },
  async getBalanceForProfiles(
    profileIds: number[],
  ): Promise<{ id: number; balance: number }[]> {
    const transactionSums =
      await getSumOfTransactionsByTypeAndProfileId(profileIds);

    const balances = profileIds.map((profileId) => {
      const balanceForProfile = calculateBalanceForProfile(
        profileId,
        transactionSums,
      );

      return { id: profileId, balance: balanceForProfile };
    });

    return balances;
  },
});
