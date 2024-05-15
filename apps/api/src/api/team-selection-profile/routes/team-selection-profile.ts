/**
 * team-selection-profile router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::team-selection-profile.team-selection-profile",
  {
    except: ["delete", "update", "create"],
    config: {
      find: {},
      findOne: {},
    },
  },
);
