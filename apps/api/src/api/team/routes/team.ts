/**
 * team router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::team.team", {
  config: {
    find: {},
    findOne: {},
    update: {
      policies: ["global::is-user"],
    },
    create: {
      policies: ["global::is-user"],
    },
    delete: {
      policies: ["global::is-user"],
    },
  },
});
