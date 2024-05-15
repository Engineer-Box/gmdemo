/**
 * notification router
 */

import { factories } from "@strapi/strapi";

export const sharedConfig = {};

export default factories.createCoreRouter("api::notification.notification", {
  except: ["create"],
  config: {
    find: {
      policies: ["global::is-user-or-admin"],
    },
    findOne: {
      policies: ["global::is-user-or-admin"],
    },
    update: {
      policies: ["global::is-user"],
    },
    markAllAsSeen: {
      policies: ["global::is-user"],
    },
    delete: {
      policies: ["global::is-user"],
    },
  },
});
