/**
 * team service
 */

import { factories } from "@strapi/strapi";
import merge from "deepmerge";

const sharedTeamSelectionFilters = {
  result: { $null: true },
  id: { $notNull: true },
  battle: {
    is_cancelled: { $ne: true },
  },
};

// TODO: Note that this will only work on object types
const getParamsWithGamePopulated = (params: any = {}) =>
  params?.populate?.game ? params : merge(params, { populate: { game: {} } });

const shouldPopulateTeamLeaderboardItemStats = (params: any = {}) => {
  return !!params?.populate?.leaderboard_item_stats;
};

const getTeamProfilePopulate = (params: any = {}) =>
  params?.populate?.team_profiles?.populate ?? {};

export default factories.createCoreService("api::team.team", {
  async hasPendingResults(teamId: number) {
    const teamSelectionProfilesWithPendingMatches = await strapi.db
      .query("api::team-selection.team-selection")
      .findMany({
        limit: 999,
        populate: {
          team_selection_profiles: {
            populate: {
              team_profile: true,
            },
          },
        },
        where: {
          team: teamId,
          $or: [
            {
              home_match: sharedTeamSelectionFilters,
            },
            {
              away_match: sharedTeamSelectionFilters,
            },
          ],
        },
      });

    if (teamSelectionProfilesWithPendingMatches.length === 999) {
      throw new Error("Too many team selection profiles found");
    }

    const participatingTeamProfileIds =
      teamSelectionProfilesWithPendingMatches
        .flatMap((teamSelection) => teamSelection.team_selection_profiles)
        .map((teamSelectionProfile) => teamSelectionProfile.team_profile.id) ??
      [];

    return {
      hasPendingResults: teamSelectionProfilesWithPendingMatches.length > 0,
      participatingTeamProfileIds,
    };
  },

  async findOne(entityId, params) {
    const populateLeaderboardItemStats =
      shouldPopulateTeamLeaderboardItemStats(params);

    const team = await super.findOne(
      entityId,
      populateLeaderboardItemStats
        ? getParamsWithGamePopulated(params)
        : params,
    );

    if (!team) return null;

    if (populateLeaderboardItemStats) {
      const teamProfilesPopulate = getTeamProfilePopulate(params);

      team.leaderboard_item_stats = await strapi
        .service("api::leaderboard.leaderboard")
        .getAllTimeLeaderboardItemStats("game-team", team.id, team.game.id);

      if (teamProfilesPopulate.leaderboard_item_stats) {
        const { results: teamProfilesWithLeaderboardItemStats } = await strapi
          .service("api::team-profile.team-profile")
          .find({
            filters: {
              id: { $in: team.team_profiles.map((tp) => tp.id) },
            },
            populate: teamProfilesPopulate,
          });

        team.team_profiles = teamProfilesWithLeaderboardItemStats;
      }
    }

    const profileIds =
      team?.team_profiles
        ?.map((teamProfile) => teamProfile.profile?.id)
        .filter(Boolean) ?? [];

    if (profileIds.length > 0) {
      const profileBalances = await strapi
        .service("api::profile.profile")
        .getBalanceForProfiles(profileIds);

      team?.team_profiles?.forEach((teamProfile) => {
        if (teamProfile.profile) {
          teamProfile.profile.balance = profileBalances.find(
            (profile) => profile.id === teamProfile.profile.id,
          )?.balance;
        }
      });
    }

    return team;
  },

  async findOneNotDeleted(entityId, params) {
    const team = await this.findOne(entityId, params);

    return team?.deleted ? null : team;
  },

  async find(params) {
    const populateLeaderboardItemStats =
      shouldPopulateTeamLeaderboardItemStats(params);

    const teams = await super.find(
      populateLeaderboardItemStats
        ? getParamsWithGamePopulated(params)
        : params,
    );

    const profileIds =
      teams.results
        ?.map(
          (team) =>
            team?.team_profiles?.map((teamProfile) => teamProfile.profile?.id),
        )
        .flat()
        .filter(Boolean) ?? [];

    if (profileIds.length > 0) {
      const profileBalances = await strapi
        .service("api::profile.profile")
        .getBalanceForProfiles(profileIds);

      teams.results.forEach((team) => {
        team.team_profiles?.forEach((teamProfile) => {
          if (teamProfile.profile) {
            teamProfile.profile.balance =
              profileBalances.find(
                (profile) => profile.id === teamProfile.profile.id,
              )?.balance ?? 0;
          }
        });
      });
    }

    if (populateLeaderboardItemStats) {
      const teamIdAndGameIdTuples = teams.results.map((team) => [
        team.id,
        team.game.id,
      ]);

      const leaderboardItemStats = await strapi
        .service("api::leaderboard.leaderboard")
        .getAllTimeLeaderboardItemsStats("game-team", teamIdAndGameIdTuples);

      teams.results.forEach(async (team) => {
        team.leaderboard_item_stats = leaderboardItemStats.find(
          (lis) => lis.id === team.id,
        );
      });
    }

    return teams;
  },

  async delete(entityId) {
    return await super.update(entityId, {
      data: {
        deleted: true,
      },
    });
  },
});
