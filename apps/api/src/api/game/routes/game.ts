/**
 * game router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::game.game", {
  only: ["find", "findOne"],
  config: {
    find: {},
    findOne: {},
  },
});
