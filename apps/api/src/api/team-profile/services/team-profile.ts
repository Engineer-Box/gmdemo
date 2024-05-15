/**
 * team-profile service
 */

import { factories } from "@strapi/strapi";
import merge from "deepmerge";

const getParamsWithTeamsGamePopulated = (params: any = {}) =>
  params?.populate?.team?.game
    ? params
    : merge(params, {
      populate: { profile: {}, team: { populate: { game: {} } } },
    });

const shouldPopulateTeamLeaderboardItemStats = (params: any = {}) =>
  params?.populate?.leaderboard_item_stats;

export default factories.createCoreService("api::team-profile.team-profile", {
  async createOrRestore(params) {
    const existingTeamProfile = await this.find({
      filters: {
        team: params.data.team,
        profile: params.data.profile,
      },
    });

    const mergedParams = merge(params, {
      data: {
        deleted: false,
      },
    });
    const teamProfile =
      existingTeamProfile.results.length > 0
        ? await super.update(existingTeamProfile.results[0].id, mergedParams)
        : await this.create(mergedParams);

    try {
      if (teamProfile.role !== "founder") {
        await strapi.service("api::notification.notification").create({
          data: {
            type: "TEAM_INVITE_RECEIVED",
            team: params.data.team,
            profile: params.data.profile,
          },
        });
      }
    } catch (error) { }

    return teamProfile;
  },
  async findOne(entityId, params) {
    const populateLeaderboardItemStats =
      shouldPopulateTeamLeaderboardItemStats(params);

    const teamProfile = await super.findOne(
      entityId,
      populateLeaderboardItemStats
        ? getParamsWithTeamsGamePopulated(params)
        : params,
    );

    if (teamProfile?.profile?.id) {
      teamProfile.profile.balance = await strapi
        .service("api::profile.profile")
        .getBalanceForProfile(teamProfile.profile.id);
    }

    if (populateLeaderboardItemStats) {
      teamProfile.leaderboard_item_stats = await strapi
        .service("api::leaderboard.leaderboard")
        .getAllTimeLeaderboardItemStats(
          "game-profile",
          teamProfile.profile.id,
          teamProfile.team.game.id,
        );
    }

    return teamProfile;
  },

  async findOneNotDeleted(entityId, params) {
    const teamProfile = await this.findOne(entityId, params);

    return teamProfile?.deleted ? null : teamProfile;
  },

  async find(params) {
    const populateLeaderboardItemStats =
      shouldPopulateTeamLeaderboardItemStats(params);

    const teamProfiles = await super.find(
      populateLeaderboardItemStats
        ? getParamsWithTeamsGamePopulated(params)
        : params,
    );
    const profileIds =
      teamProfiles.results
        ?.map((teamProfile) => teamProfile.profile?.id)
        .filter(Boolean) ?? [];

    if (profileIds.length) {
      const profileBalances = await strapi
        .service("api::profile.profile")
        .getBalanceForProfiles(profileIds);

      teamProfiles.results.forEach((teamProfile) => {
        if (teamProfile.profile) {
          teamProfile.profile.balance =
            profileBalances.find(
              (profile) => profile.id === teamProfile.profile.id,
            )?.balance ?? 0;
        }
      });
    }

    if (populateLeaderboardItemStats) {
      const profileIdAndGameIdTuples = teamProfiles.results.map(
        (teamProfile) => [teamProfile.profile.id, teamProfile.team.game.id],
      );

      const leaderboardItemStats = await strapi
        .service("api::leaderboard.leaderboard")
        .getAllTimeLeaderboardItemsStats(
          "game-profile",
          profileIdAndGameIdTuples,
        );

      teamProfiles.results.forEach((teamProfile) => {
        teamProfile.leaderboard_item_stats = leaderboardItemStats.find(
          (leaderboardItemStat) =>
            leaderboardItemStat.id === teamProfile.profile.id,
        );
      });
    }

    return teamProfiles;
  },

  async findTeamProfilesByTeamId(teamId, params: any = {}) {
    const mergedParams = merge(params, {
      filters: {
        team: teamId,
      },
    });

    const teamProfiles = await this.find(mergedParams);

    return teamProfiles;
  },

  async findTeamProfileByProfileId(teamId, profileId, params: any = {}) {
    const mergedParams = merge(params, {
      filters: {
        team: teamId,
        profile: profileId,
      },
    });

    const teamProfiles = await this.find(mergedParams);

    return teamProfiles.results[0] ?? null;
  },

  async findFounderTeamProfile(teamId, params: any = {}) {
    const mergedParams = merge(params, {
      filters: {
        role: "founder",
      },
      populate: {
        profile: true,
      },
    });

    const profiles = await this.findTeamProfilesByTeamId(teamId, mergedParams);

    const founder = profiles.results[0];
    return founder;
  },

  async delete(entityId) {
    return await super.update(entityId, {
      data: {
        deleted: true,
      },
    });
  },
});
