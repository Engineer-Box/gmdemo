/**
 * gamer-tag controller
 */

import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

enum GamerTagErrors {
  TagCannotBeEmpty = "GamerTagCannotBeEmpty",
  TagTakenForGame = "GamerTagTakenForGame",
  InTeamForGamerTagGame = "GamerTagRequiredIfInTeamForGame",
  AlreadyHaveGamerTag = "AlreadyHaveGamerTagForGame",
  PendingResultsForGame = "PendingResultsForGame",
}

const formatGamerTag = (tag?: string) => (tag ?? "").trim();

const getSharedGamerTagError = async (tag: string, game: number) => {
  if (tag.length < 1) {
    return GamerTagErrors.TagCannotBeEmpty;
  }

  const gamerTagIsUniqueForGame = await strapi
    .service("api::gamer-tag.gamer-tag")
    .isUniqueForGame(game, tag);

  if (!gamerTagIsUniqueForGame) {
    return GamerTagErrors.TagTakenForGame;
  }

  return null;
};

export default factories.createCoreController("api::gamer-tag.gamer-tag", {
  async create(ctx) {
    const requestData = ctx.request.body.data ?? {};
    const formattedTag = formatGamerTag(requestData.tag);

    const gamerTagError = await getSharedGamerTagError(
      formattedTag,
      requestData.game,
    );

    if (gamerTagError) {
      return ctx.badRequest(gamerTagError);
    }

    const profile = await strapi
      .service("api::profile.profile")
      .findOneByWalletAddress(ctx.state.wallet_address, {
        populate: {
          gamer_tags: {
            populate: {
              game: true,
            },
          },
        },
      });

    const hasGamerTagForGame = profile.gamer_tags.some(
      ({ game }) => game.id === requestData.game,
    );

    if (hasGamerTagForGame) {
      ctx.badRequest(GamerTagErrors.AlreadyHaveGamerTag);
      return;
    }

    ctx.request.body.data.tag = formattedTag;
    ctx.request.body.data.profile = profile.id;

    const newlyCreatedGamerTag = await super.create(ctx);
    return newlyCreatedGamerTag;
  },

  async update(ctx) {
    const requestData = ctx.request.body.data ?? {};
    const gamerTagId = parseInt(ctx.params.id);
    const formattedTag = formatGamerTag(requestData.tag);

    const profile = await strapi
      .service("api::profile.profile")
      .findOneByWalletAddress(ctx.state.wallet_address, {
        populate: {
          team_profiles: {
            filters: {
              deleted: { $ne: true },
              is_pending: { $ne: true },
            },
            populate: {
              team: {
                populate: {
                  game: true,
                },
              },
            },
          },
        },
      });

    const gamerTag = await strapi
      .service("api::gamer-tag.gamer-tag")
      .findOne(gamerTagId, { populate: { game: true, profile: true } });

    if (profile.id !== gamerTag.profile.id) {
      throw new errors.UnauthorizedError();
    }

    const tagWasChanged = requestData.tag && requestData.tag !== gamerTag.tag;

    if (tagWasChanged) {
      const gamerTagError = await getSharedGamerTagError(
        formattedTag,
        gamerTag.game.id,
      );

      const activeTeamProfileForGame = profile.team_profiles?.find(
        (tp) => tp.team.game.id === gamerTag.game.id,
      );

      if (activeTeamProfileForGame) {
        const pendingResults = await strapi
          .service("api::team.team")
          .hasPendingResults(activeTeamProfileForGame.team.id);

        if (
          pendingResults.hasPendingResults &&
          pendingResults.participatingTeamProfileIds.includes(
            activeTeamProfileForGame.id,
          )
        ) {
          return ctx.badRequest(GamerTagErrors.PendingResultsForGame);
        }
      }

      if (gamerTagError) {
        return ctx.badRequest(gamerTagError);
      }
    }

    const didUpdateGame =
      requestData.game && requestData.game !== gamerTag.game.id;

    const didUpdateProfile =
      requestData.profile && requestData.profile !== gamerTag.profile.id;

    if (didUpdateGame || didUpdateProfile) {
      ctx.badRequest("Cannot update the game or profile for a gamer tag");
      return;
    }

    ctx.request.body.data.tag = formattedTag;
    const updatedGamerTag = await super.update(ctx);

    return updatedGamerTag;
  },
  async delete(ctx) {
    const gamerTagId = parseInt(ctx.params.id);
    const profile = await strapi
      .service("api::profile.profile")
      .findOneByWalletAddress(ctx.state.wallet_address, {
        populate: {
          team_profiles: {
            populate: {
              team: {
                populate: {
                  game: true,
                },
              },
            },
          },
          gamer_tags: {
            populate: {
              game: true,
            },
          },
        },
      });

    const gamerTagToDelete = profile.gamer_tags.find(
      (gamerTag) => gamerTag.id === gamerTagId,
    );

    if (!gamerTagToDelete) {
      throw new errors.NotFoundError();
    }

    const gamerTagGameId = gamerTagToDelete.game.id;

    const teamProfileForGame = profile.team_profiles
      .filter((teamProfile) => !teamProfile.is_pending)
      .filter((teamProfile) => !teamProfile.deleted)
      .find((teamProfile) => teamProfile.team.game.id === gamerTagGameId);

    if (teamProfileForGame) {
      ctx.badRequest(GamerTagErrors.InTeamForGamerTagGame);
      return;
    }

    const deletedGamerTag = await super.delete(ctx);
    return deletedGamerTag;
  },
});
