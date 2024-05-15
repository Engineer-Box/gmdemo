/**
 * battle router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::battle.battle", {
  except: ["delete", "update", "create"],
  config: {
    find: {},
    findOne: {},
  },
});
