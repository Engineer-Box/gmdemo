/**
 * gamer-tag service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService("api::gamer-tag.gamer-tag", {
  async isUniqueForGame(game: number, tag: string) {
    const matchingTags = await strapi.db
      .query("api::gamer-tag.gamer-tag")
      .findMany({ where: { tag, game } });

    return matchingTags.length === 0;
  },
  async doesProfileHaveGamerTagForGame(profile: number, game: number) {
    const matchingTags = await strapi.db
      .query("api::gamer-tag.gamer-tag")
      .findMany({ where: { profile, game } });

    return matchingTags.length > 0;
  },
});
