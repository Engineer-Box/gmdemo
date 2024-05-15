/**
 * profile router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::profile.profile", {
  except: ["delete"],
  config: {
    find: {},
    findOne: {},
    create: {
      policies: ["global::is-admin"],
    },
    update: {
      policies: ["global::is-user"],
    },
  },
});
