/**
 * game controller
 */

import { factories } from "@strapi/strapi";
import { getKeysCount, getOnlineUserGameKey, redis } from "../../../redis";

export default factories.createCoreController(
  "api::game.game",
  ({ strapi }) => ({
    async findOne(ctx) {
      const bySlug = ctx.query.bySlug === "true" || ctx.query.bySlug === true;
      const idOrSlug = ctx.params.id;

      if (bySlug) {
        const gameForSlug = await strapi.db.query("api::game.game").findOne({
          select: ["id"],
          where: {
            slug: idOrSlug,
          },
        });

        if (!gameForSlug) {
          return ctx.notFound();
        }

        ctx.params.id = gameForSlug.id;
      }
      const gameId = parseInt(ctx.params.id);
      const game = await super.findOne(ctx);
      const livePlayerCount = await getKeysCount(
        getOnlineUserGameKey(gameId) + "*",
      );

      const liveMatchCount = await strapi.db.query("api::match.match").count({
        where: {
          result: { $null: true },
          home_team: {
            team: {
              game: {
                id: { $eq: gameId },
              },
            },
          },
        },
      });

      if (game && game.data && game.data.attributes) {
        game.data.attributes.live = {
          players: livePlayerCount,
          matches: liveMatchCount,
        };
      }

      return game;
    },
  }),
);
