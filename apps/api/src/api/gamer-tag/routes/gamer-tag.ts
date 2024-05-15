/**
 * gamer-tag router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter("api::gamer-tag.gamer-tag", {
  config: {
    find: {},
    findOne: {},
    create: {
      policies: ["global::is-user"],
    },
    update: {
      policies: ["global::is-user"],
    },
    delete: {
      policies: ["global::is-user"],
    },
  },
});
