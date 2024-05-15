/**
 * team-selection router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::team-selection.team-selection",
  {
    except: ["delete", "update", "create"],
    config: {
      find: {},
      findOne: {},
    },
  },
);
