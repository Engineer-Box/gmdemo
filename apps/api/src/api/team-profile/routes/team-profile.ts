/**
 * team-profile router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::team-profile.team-profile", {
  except: ["create"],
  config: {
    find: {},
    findOne: {},
    update: {
      policies: ["global::is-user"],
    },
    delete: {
      policies: ["global::is-user"],
    },
  },
});
