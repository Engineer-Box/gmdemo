/**
 * is-user-or-admin policy
 */

export default async ({ state }, config, { strapi }) => {
  if (state.wallet_address) {
    const profile = await strapi
      .service("api::profile.profile")
      .findOneByWalletAddress(state.wallet_address);

    if (profile && !profile.suspended) {
      return true;
    }
  }

  return !!state.api_token;
};
