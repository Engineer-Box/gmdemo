/**
 * leaderboard service
 */

import {
  getEntityKey,
  getRankingsKey,
  matchSetKey,
  redis,
  LeaderboardType,
  getRedisHashes,
  getAllKeys,
} from "../../../redis";

type BaseUpdate = {
  earnings: number;
  xp: number;
  month: number;
  year: number;
  didWin: boolean;
};

type ProfileUpdates = (BaseUpdate & {
  profileId: number;
})[];

type GameProfileUpdates = (BaseUpdate & {
  profileId: number;
  gameId: number;
})[];

type GameTeamUpdates = (BaseUpdate & {
  teamId: number;
  gameId: number;
})[];

const forEachPeriod = (
  year: number,
  month: number,
  callback: (period: { year?: number; month?: number }) => void,
) => {
  const timePeriods = [
    {
      year: undefined,
      month: undefined,
    },
    {
      year: year,
      month: undefined,
    },
    {
      year: year,
      month: month,
    },
  ];

  timePeriods.forEach((period) => {
    callback(period);
  });
};

const getUpdatesFromMatch = (match: any) => {
  const completedDate = new Date(match.completed_date);
  const year = completedDate.getFullYear();
  const month = completedDate.getMonth() + 1;
  const gameId = match.home_team.team.game.id;

  const teamSelections = [match.home_team, match.away_team];
  const gameTeamUpdates: GameTeamUpdates = teamSelections.map(
    (teamSelection) => ({
      earnings: teamSelection.earnings,
      xp: teamSelection.xp,
      month,
      year,
      didWin: teamSelection.did_win,
      teamId: teamSelection.team.id,
      gameId,
    }),
  );

  const profileUpdates: ProfileUpdates = [];
  const gameProfileUpdates: GameProfileUpdates = [];
  const teamSelectionProfiles = [
    ...match.home_team.team_selection_profiles,
    ...match.away_team.team_selection_profiles,
  ];
  teamSelectionProfiles.forEach((teamSelectionProfile) => {
    const { earnings, did_win, xp } = teamSelectionProfile;
    const profileId = teamSelectionProfile.team_profile.profile.id;

    const shared = {
      earnings,
      xp,
      profileId,
      didWin: did_win,
      year,
      month,
    };

    profileUpdates.push({ ...shared });

    gameProfileUpdates.push({
      ...shared,
      gameId,
    });
  });

  return {
    gameTeamUpdates,
    profileUpdates,
    gameProfileUpdates,
  };
};

const teamSelectionPopulate = {
  populate: {
    team: {
      populate: {
        game: true,
        image: true,
      },
    },
    team_selection_profiles: {
      populate: {
        team_profile: {
          populate: {
            profile: true,
          },
        },
      },
    },
  },
};

const matchPopulate = {
  home_team: teamSelectionPopulate,
  away_team: teamSelectionPopulate,
};

type LeaderboardItemStats = {
  id: number;
  earnings: number;
  xp: number;
  rank?: number;
  lost: number;
  won: number;
};

const createLeaderboardItemStats = ({
  id,
  earnings,
  xp,
  rank,
  lost,
  won,
}: {
  id: string | number;
  earnings?: string | number;
  xp?: string | number;
  lost?: string | number;
  won?: string | number;
  rank?: number;
}): LeaderboardItemStats => ({
  id: typeof id === "number" ? id : parseInt(id),
  earnings: earnings
    ? typeof earnings === "number"
      ? earnings
      : parseInt(earnings)
    : 0,
  lost: lost ? (typeof lost === "number" ? lost : parseInt(lost)) : 0,
  won: won ? (typeof won === "number" ? won : parseInt(won)) : 0,
  xp: xp ? (typeof xp === "number" ? xp : parseInt(xp)) : 0,
  rank: rank ? (typeof rank === "number" ? rank : parseInt(rank)) : undefined,
});

const createEntityIdFromId = (
  id: number | string,
  rankingId?: number | string,
) => `${rankingId ? `${rankingId}-` : ""}${id}`;

export default () => ({
  async getAllTimeLeaderboardItemStats(
    leaderboardType: LeaderboardType,
    entityId: string | number,
    rankingId?: string | number,
  ) {
    const rankingsKey = getRankingsKey(leaderboardType, {
      rankingId,
    });

    const fullEntityId = createEntityIdFromId(entityId, rankingId);
    const zeroIndexedRank = await redis.zrevrank(rankingsKey, fullEntityId);
    const rank =
      typeof zeroIndexedRank === "number" ? zeroIndexedRank + 1 : undefined;
    const redisEntity = await redis.hgetall(
      getEntityKey(leaderboardType, fullEntityId),
    );

    const itemStats = createLeaderboardItemStats({
      id: entityId,
      rank,
      ...(redisEntity as any),
    });
    return itemStats;
  },

  async getAllTimeLeaderboardItemsStats(
    leaderboardType: LeaderboardType,
    items: [string | number, string | number | undefined][],
  ) {
    let leaderboardStatItems = [];
    const entityIdIndex =
      leaderboardType === "game-team" ? "team_id" : "profile_id";

    const fullEntityIds = items.map(([entityId, rankingId]) =>
      createEntityIdFromId(entityId, rankingId),
    );

    const redisEntities = await getRedisHashes(
      fullEntityIds.map((fullEntityId) =>
        getEntityKey(leaderboardType, fullEntityId),
      ),
    );

    const rankPipeline = redis.pipeline();
    items.forEach(([entityId, rankingId]) => {
      const rankingsKey = getRankingsKey(leaderboardType, {
        rankingId,
      });
      const fullEntityId = createEntityIdFromId(entityId, rankingId);
      rankPipeline.zrevrank(rankingsKey, fullEntityId, (err, res) => {
        if (err) return;

        const matchingItem = redisEntities.find(
          (re) => re[entityIdIndex] == entityId.toString(),
        );

        leaderboardStatItems.push(
          createLeaderboardItemStats({
            id: entityId,
            ...matchingItem,
            rank: res !== null ? res + 1 : undefined,
          }),
        );
      });
    });

    await rankPipeline.exec();

    return leaderboardStatItems;
  },

  async recalculateLeaderboards() {
    const entityKeys = await getAllKeys("entity:*");
    const rankingKeys = await getAllKeys("ranking:*");
    const keysToDelete = [...entityKeys, ...rankingKeys, "match-set"];
    const deletePipeline = redis.pipeline();

    keysToDelete.forEach((key) => {
      deletePipeline.del(key);
    });

    await deletePipeline.exec();

    let start = 0;
    let hasMore = true;
    const limit = 1000;

    while (hasMore) {
      const matches = await strapi.service("api::match.match").find({
        pagination: {
          limit,
          start,
        },
        populate: matchPopulate,
        filters: {
          completed_date: { $ne: null },
        },
      });

      const matchIds = matches.results.map((match) => match.id);

      const updates = matches.results.reduce(
        (updates, match) => {
          const { profileUpdates, gameProfileUpdates, gameTeamUpdates } =
            getUpdatesFromMatch(match);
          updates.profileUpdates.push(...profileUpdates);
          updates.gameProfileUpdates.push(...gameProfileUpdates);
          updates.gameTeamUpdates.push(...gameTeamUpdates);

          return updates;
        },
        {
          profileUpdates: [],
          gameProfileUpdates: [],
          gameTeamUpdates: [],
        },
      );

      await Promise.all([
        this.updateProfileLeaderboard(updates.profileUpdates),
        this.updateGameProfileLeaderboard(updates.gameProfileUpdates),
        this.updateTeamLeaderboard(updates.gameTeamUpdates),
        matchIds.length > 0 && redis.sadd(matchSetKey, matchIds),
      ]);

      hasMore = start + limit < matches.pagination.total;
      start += limit;
    }
  },

  async updateLeaderboardsForMatch(matchId: number) {
    const wasMatchAdded = await redis.sismember(matchSetKey, matchId);

    if (wasMatchAdded) {
      return;
    }

    const match = await strapi.service("api::match.match").findOne(matchId, {
      populate: matchPopulate,
    });

    const { profileUpdates, gameProfileUpdates, gameTeamUpdates } =
      getUpdatesFromMatch(match);

    await Promise.all([
      this.updateProfileLeaderboard(profileUpdates),
      this.updateGameProfileLeaderboard(gameProfileUpdates),
      this.updateTeamLeaderboard(gameTeamUpdates),
    ]);

    await redis.sadd(matchSetKey, matchId);
  },
  async updateProfileLeaderboard(updates: ProfileUpdates) {
    const pipeline = redis.pipeline();

    updates.forEach((update) => {
      const { profileId, didWin, earnings, xp, month, year } = update;
      const profileEntityId = profileId;

      forEachPeriod(year, month, (period) => {
        // update the rankings
        const rankingsKey = getRankingsKey("profile", {
          ...period,
        });
        pipeline.zincrby(rankingsKey, xp, profileEntityId);

        // update the entities
        const entityKey = getEntityKey(
          "profile",
          profileEntityId,
          period.year,
          period.month,
        );
        pipeline.hsetnx(entityKey, "profile_id", profileId);
        pipeline.hincrby(entityKey, "earnings", earnings);
        pipeline.hincrby(entityKey, "xp", xp);
        pipeline.hincrby(entityKey, didWin ? "won" : "lost", 1);
      });
    });

    await pipeline.exec();
  },

  async updateGameProfileLeaderboard(updates: GameProfileUpdates) {
    const pipeline = redis.pipeline();

    updates.forEach((update) => {
      const { profileId, gameId, didWin, earnings, xp, month, year } = update;
      const gameProfileEntityId = `${gameId}-${profileId}`;

      forEachPeriod(year, month, (period) => {
        // update the rankings
        const rankingsKey = getRankingsKey("game-profile", {
          rankingId: gameId,
          ...period,
        });
        pipeline.zincrby(rankingsKey, xp, gameProfileEntityId);

        // update the entities
        const entityKey = getEntityKey(
          "game-profile",
          gameProfileEntityId,
          period.year,
          period.month,
        );
        pipeline.hsetnx(entityKey, "profile_id", profileId);
        pipeline.hsetnx(entityKey, "game_id", gameId);
        pipeline.hsetnx(entityKey, "won", 0);
        pipeline.hsetnx(entityKey, "lost", 0);
        pipeline.hincrby(entityKey, "earnings", earnings);
        pipeline.hincrby(entityKey, "xp", xp);
        pipeline.hincrby(entityKey, didWin ? "won" : "lost", 1);
      });
    });

    await pipeline.exec();
  },
  async updateTeamLeaderboard(updates: GameTeamUpdates) {
    const pipeline = redis.pipeline();

    updates.forEach((update) => {
      const { teamId, didWin, earnings, xp, month, year, gameId } = update;
      const teamEntityId = `${gameId}-${teamId}`;

      forEachPeriod(year, month, (period) => {
        // update the rankings
        const rankingsKey = getRankingsKey("game-team", {
          rankingId: gameId,
          ...period,
        });
        pipeline.zincrby(rankingsKey, xp, teamEntityId);

        // update the entities
        const entityKey = getEntityKey(
          "game-team",
          teamEntityId,
          period.year,
          period.month,
        );
        pipeline.hsetnx(entityKey, "team_id", teamId);
        pipeline.hsetnx(entityKey, "won", 0);
        pipeline.hsetnx(entityKey, "lost", 0);
        pipeline.hincrby(entityKey, "earnings", earnings);
        pipeline.hincrby(entityKey, "xp", xp);
        pipeline.hincrby(entityKey, didWin ? "won" : "lost", 1);
      });
    });

    await pipeline.exec();
  },
});
