/**
 * match router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::match.match", {
  except: ["delete", "update", "create"],
  config: {
    find: {
      policies: ["global::is-user"],
    },
    findOne: {
      policies: ["global::is-user"],
    },
  },
});
