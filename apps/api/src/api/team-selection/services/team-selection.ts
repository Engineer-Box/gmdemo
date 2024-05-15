/**
 * team-selection service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::team-selection.team-selection",
  {
    async findOne(entityId, params) {
      const teamSelection = await super.findOne(entityId, params);

      if (!teamSelection) return null;

      if (teamSelection.team) {
        teamSelection.team = await strapi
          .service("api::team.team")
          .findOne(teamSelection.team.id, {
            populate: params.populate.team.populate,
          });
      }

      const teamProfilePopulate =
        params.populate?.team_selection_profiles?.populate?.team_profile
          ?.populate;

      if (teamProfilePopulate?.leaderboard_item_stats) {
        const teamProfileIds =
          (teamSelection?.team_selection_profiles?.map(
            (tsp) => tsp?.team_profile?.id,
          )).filter(Boolean) ?? [];

        const { results: populatedTeamProfiles } = await strapi
          .service("api::team-profile.team-profile")
          .find({
            populate: teamProfilePopulate,
            filters: {
              id: {
                $in: teamProfileIds,
              },
            },
          });

        teamSelection.team_selection_profiles.forEach((tsp) => {
          tsp.team_profile = populatedTeamProfiles.find(
            (ptsp) => ptsp.id === tsp.team_profile.id,
          );
        });
      }

      return teamSelection;
    },
  },
);
