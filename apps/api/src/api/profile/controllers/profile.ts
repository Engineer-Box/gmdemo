/**
 * profile controller
 *
 * Can be overriden here:
 * https://github.com/strapi/strapi/blob/main/packages/core/strapi/src/core-api/controller/collection-type.ts#L16
 */

import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { z } from "zod";
import { getKeysCount, getOnlineUserGameUserKey, redis } from "../../../redis";

const profileUpdateSchema = z
  .object({
    region: z.string(),
    username: z.string().max(20),
    wager_mode: z.boolean(),
    avatar: z.number(),
    bio: z.string().max(248),
    trust_mode: z.boolean(),
    social_links: z
      .object({
        discord: z.string().nullable(),
        twitter: z.string().nullable(),
        twitch: z.string().nullable(),
        youtube: z.string().nullable(),
      })
      .partial(),
  })
  .partial();

export default factories.createCoreController(
  "api::profile.profile",
  ({ strapi }) => ({
    async getProfileWithVouchAndLeaderboardStats(ctx) {
      const profile = await strapi
        .service("api::profile.profile")
        .findOneWithVouchAndLeaderboardStats(ctx.params.profileId, ctx.query);

      return this.transformResponse(profile);
    },

    async findOneByWalletAddress(ctx) {
      const walletAddress = ctx.params.walletAddress;

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(walletAddress, ctx.query);

      if (!profile) {
        return ctx.notFound();
      }

      return this.transformResponse(profile);
    },

    async update(ctx) {
      const id = parseInt(ctx.params.id);
      const parseRequestDataResult = profileUpdateSchema.safeParse(
        ctx.request.body.data,
      );

      if (!parseRequestDataResult.success) {
        return ctx.badRequest();
      }

      const parsedRequestData = parseRequestDataResult.data;
      ctx.request.body.data = parsedRequestData;

      const { wallet_address, username, social_links } = await strapi
        .service("api::profile.profile")
        .findOne(id, { populate: { social_links: true } });

      if (wallet_address !== ctx.state.wallet_address) {
        throw new errors.UnauthorizedError();
      }

      if (parsedRequestData.username && username) {
        ctx.badRequest("Cannot update username if already set");
        return;
      }

      if (parsedRequestData.social_links) {
        const { id, ...existingSocialLinks } = social_links ?? {};
        const updatedSocialLinks = {
          ...existingSocialLinks,
          ...parsedRequestData.social_links,
        };
        ctx.request.body.data.social_links = updatedSocialLinks;
      }

      await super.update(ctx);

      const withVouchAndLeaderboardStats = await strapi
        .service("api::profile.profile")
        .findOneWithVouchAndLeaderboardStats(id, ctx.query);

      return this.transformResponse(withVouchAndLeaderboardStats);
    },
    async vouch(ctx) {
      const profileIdToVouch = parseInt(ctx.params.profileId);

      const vouchingProfile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address, {
          populate: {
            vouched_for: {
              filters: {
                id: profileIdToVouch,
              },
            },
          },
        });

      if (vouchingProfile.id === profileIdToVouch) {
        return ctx.badRequest("Cannot vouch for yourself");
      }

      const alreadyVouched = vouchingProfile.vouched_for?.length > 0;
      const action = alreadyVouched ? "disconnect" : "connect";

      await strapi.service("api::profile.profile").update(vouchingProfile.id, {
        data: {
          vouched_for: {
            [action]: [profileIdToVouch],
          },
        },
      });

      return 200;
    },
    async favouriteGame(ctx) {
      const gameId = parseInt(ctx.params.gameId);

      const game = await strapi.service("api::game.game").findOne(gameId);

      if (!game) {
        return ctx.notFound();
      }

      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address, {
          populate: {
            favourite_games: {
              filters: {
                id: gameId,
              },
            },
          },
        });

      const alreadyFavourite = profile.favourite_games?.length > 0;
      const action = alreadyFavourite ? "disconnect" : "connect";

      await strapi.service("api::profile.profile").update(profile.id, {
        data: {
          favourite_games: {
            [action]: [gameId],
          },
        },
      });

      return 200;
    },

    async logOnlineUser(ctx) {
      const ttlSeconds = 60 * 6;
      const profile = await strapi
        .service("api::profile.profile")
        .findOneByWalletAddress(ctx.state.wallet_address, {
          populate: {
            team_profiles: {
              filters: { deleted: false, is_pending: false },
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

      const pipeline = redis.pipeline();
      profile.team_profiles.forEach((teamProfile) => {
        const gameId = teamProfile.team.game.id;
        pipeline.set(
          getOnlineUserGameUserKey(gameId, profile.id),
          1,
          "EX",
          ttlSeconds,
        );
      });

      await pipeline.exec();

      return 200;
    },
  }),
);
