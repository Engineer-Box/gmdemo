/**
 * is-user policy
 */

export default async (policyContext, config, { strapi }) => {
  const profile = await strapi
    .service("api::profile.profile")
    .findOneByWalletAddress(policyContext.state.wallet_address);

  if (profile && !profile.suspended) {
    return true;
  }

  return false;
};
