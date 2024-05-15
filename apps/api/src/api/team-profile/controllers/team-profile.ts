/**
 * team-profile controller
 */

import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

export default factories.createCoreController(
  "api::team-profile.team-profile",
  {
    async delete(ctx) {
      // TODO: Make sure they don't have games in progress
      // Make sure they are the requester
      const { wallet_address } = ctx.state;
      const teamProfileId = parseInt(ctx.params.id);

      const teamProfile = await strapi.services[
        "api::team-profile.team-profile"
      ].findOne(teamProfileId, { populate: { profile: true } });

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(wallet_address);

      if (!profile || teamProfile.profile.id !== profile.id) {
        throw new errors.UnauthorizedError();
      }

      // Make sure they are not the founder
      if (teamProfile.role === "founder") {
        return ctx.badRequest("Cannot delete a founders team profile");
      }

      return await strapi
        .service("api::team-profile.team-profile")
        .delete(teamProfileId);
    },
    async update(ctx) {
      // the user can only update their profile
      const { wallet_address } = ctx.state;
      const teamProfileId = parseInt(ctx.params.id);
      const teamProfile = await strapi.services[
        "api::team-profile.team-profile"
      ].findOne(teamProfileId, {
        populate: { profile: true, team: { populate: { game: true } } },
      });

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(wallet_address);

      if (!profile || teamProfile.profile.id !== profile.id) {
        throw new errors.UnauthorizedError();
      }

      const body = ctx.request.body ?? {};
      const fieldsToUpdate = Object.keys(body);

      // they can only change the is_pending status to false and only if they are not the founder
      if (fieldsToUpdate.length !== 1 || body.is_pending === true) {
        return ctx.badRequest("Tried to update unupdateable fields");
      }

      if (teamProfile.role === "founder") {
        return ctx.badRequest("Cannot set pending for founders");
      }

      // Don't allow them to accept an invite if they are already on a team for that game
      const {
        pagination: { total: teamProfilesForGame },
      } = await strapi.service("api::team-profile.team-profile").find({
        filters: {
          $and: [
            { id: { $ne: teamProfile.id } },
            { deleted: { $ne: true } },
            { profile: profile.id },
            {
              team: {
                game: teamProfile.team.game.id,
              },
            },
            { is_pending: false },
          ],
        },
      });

      if (teamProfilesForGame > 0) {
        return ctx.badRequest("You are already on a team for this game");
      }

      const profileHasGamerTagForTeamsGame = await strapi
        .service("api::gamer-tag.gamer-tag")
        .doesProfileHaveGamerTagForGame(profile.id, teamProfile.team.game.id);

      if (!profileHasGamerTagForTeamsGame) {
        return ctx.badRequest(
          "You need a gamer tag for this game to join a team",
        );
      }

      return await super.update(ctx);
    },
  },
);
