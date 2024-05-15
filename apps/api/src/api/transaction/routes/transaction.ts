/**
 * transaction router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::transaction.transaction", {
  except: ["delete", "create", "update"],
  config: {
    find: {
      policies: ["global::is-user"],
    },
    findOne: {
      policies: ["global::is-user"],
    },
  },
});
