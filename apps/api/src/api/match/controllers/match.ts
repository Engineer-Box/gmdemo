/**
 * match controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::match.match", {
  async openDispute(ctx) {
    const matchId = parseInt(ctx.request.params.id);

    if (!matchId) {
      return ctx.badRequest();
    }

    const teamCaptains = await strapi
      .service("api::match.match")
      .getTeamCaptains(matchId);

    const profile = await strapi
      .service("api::profile.profile")
      .findOneByWalletAddress(ctx.state.wallet_address);

    const isAwayTeamCaptain = teamCaptains.away?.profile.id === profile.id;
    const isHomeTeamCaptain = teamCaptains.home?.profile.id === profile.id;

    if (!isAwayTeamCaptain && !isHomeTeamCaptain) {
      return ctx.unauthorized();
    }

    await strapi.service("api::match.match").openDispute(matchId);

    return 200;
  },
});
