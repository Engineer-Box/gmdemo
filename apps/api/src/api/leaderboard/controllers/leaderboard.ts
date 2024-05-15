import {
  getEntityKey,
  getRankingsKey,
  getRedisHashes,
  redis,
} from "../../../redis";

type LeaderboardItem = {
  id: number;
  earnings: number;
  xp: number;
  rank?: number;
  title: string;
  image: any;
  lost: number;
  won: number;
};

const createLeaderboardItem = ({
  image,
  title,
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
  title: string;
  image: any;
}) => ({
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
  title,
  image,
});

const getRankings = async (
  rankingsKey: string,
  inclusiveStart: number,
  inclusiveEnd: number,
  rankItemIdsToFilter?: string[],
) => {
  const shouldFilter = Array.isArray(rankItemIdsToFilter);
  let rankItemIdAndRankTuples: [string, number | undefined][] = [];
  let total = 0;

  if (shouldFilter) {
    const pipeline = redis.pipeline();
    const allRankItemIdsAndRankTuplesInFilter = [];
    rankItemIdsToFilter.forEach((rankItemId) => {
      pipeline.zrank(rankingsKey, rankItemId, (err, rank) => {
        allRankItemIdsAndRankTuplesInFilter.push([
          rankItemId,
          rank !== null ? rank + 1 : undefined,
        ]);
      });
    });
    await pipeline.exec();
    const sortedrankItemIdAndRankTuplesInFilter =
      allRankItemIdsAndRankTuplesInFilter.sort((a, b) => a[1] - b[1]);

    total = sortedrankItemIdAndRankTuplesInFilter.filter(
      ([rankItemId, rank]) => !!rank,
    ).length;

    const paginatedrankItemIdAndRankTuplesInFilter =
      sortedrankItemIdAndRankTuplesInFilter.slice(inclusiveStart, inclusiveEnd);

    rankItemIdAndRankTuples = paginatedrankItemIdAndRankTuplesInFilter;
  } else {
    const raw = await redis.zrevrange(
      rankingsKey,
      inclusiveStart,
      inclusiveEnd - 1,
    );
    rankItemIdAndRankTuples = raw.map((rankItemId, ind) => [
      rankItemId,
      ind + inclusiveStart + 1,
    ]);
    total = await redis.zcard(rankingsKey);
  }

  return { items: rankItemIdAndRankTuples, total };
};

export default {
  async getLeaderboard(ctx) {
    const gameId = parseInt(ctx.request.params.gameId);
    const page = ctx.query.page ? parseInt(ctx.query.page) : 1;
    const query = ctx.query.query ? ctx.query.query.trim() : "";
    const pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 15;
    const inclusiveStart = (page - 1) * pageSize; // zero indexed, first item to include
    const inclusiveEnd = inclusiveStart + pageSize; // zero indexed, last item to include
    const hasQuery = (query?.length && query.length > 1) || false;
    const period = ctx.query.period ?? undefined;
    const entityType =
      ctx.query.type === "game-team" ? "game-team" : "game-profile";

    let leaderboardItems: LeaderboardItem[] = [];
    let totalLeaderboardItems = 0;

    const thisYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;
    const year = period ? thisYear : undefined;
    const month = period === "month" ? thisMonth : undefined;

    const rankingsKey = getRankingsKey(entityType, {
      rankingId: gameId,
      year,
      month,
    });
    const isProfileLeaderboard = entityType === "game-profile";
    const titleField = isProfileLeaderboard ? "username" : "name";
    const imageField = isProfileLeaderboard ? "avatar" : "image";
    const redisIdKey = isProfileLeaderboard ? "profile_id" : "team_id";
    const apiName = isProfileLeaderboard
      ? "api::profile.profile"
      : "api::team.team";

    const apiItemsToQuery =
      hasQuery &&
      (await strapi.service(apiName).find({
        pagination: {
          pageSize: 9999,
        },
        filters: isProfileLeaderboard
          ? {
              team_profiles: {
                team: {
                  game: {
                    id: gameId,
                  },
                },
              },
              username: {
                $startsWith: query,
              },
            }
          : {
              filters: {
                team: {
                  game: {
                    id: gameId,
                  },
                },
                name: {
                  $startsWith: query,
                },
              },
            },
        populate: {
          [imageField]: true,
        },
        select: ["id", titleField],
      }));

    const { items, total } = await getRankings(
      rankingsKey,
      inclusiveStart,
      inclusiveEnd,
      apiItemsToQuery &&
        apiItemsToQuery.results.map((ai) => `${gameId}-${ai.id}`),
    );

    totalLeaderboardItems = total;

    const redisEntities = await getRedisHashes(
      items.map(([id]) => getEntityKey(entityType, id, year, month)),
    );

    if (!hasQuery) {
      const apiItems = await strapi.service(apiName).find({
        filters: {
          id: {
            $in: redisEntities.map((item) => parseInt(item[redisIdKey])),
          },
        },
        populate: {
          [imageField]: true,
        },
        select: ["id", titleField],
      });

      leaderboardItems = redisEntities
        .map((redisEntity) => {
          const id = parseInt(redisEntity[redisIdKey]);
          const apiItem = apiItems.results.find((ai) => ai.id === id);

          if (!apiItem) return null;

          const rank = items.find(
            ([id]) => id === `${gameId}-${apiItem?.id}`,
          )?.[1];

          return createLeaderboardItem({
            id,
            earnings: redisEntity.earnings,
            xp: redisEntity.xp,
            rank,
            title: apiItem[titleField],
            image: apiItem[imageField],
            lost: redisEntity.lost,
            won: redisEntity.won,
          });
        })
        .filter(Boolean);
    } else {
      leaderboardItems = items
        .map(([rankItemId, rank]) => {
          const id = parseInt(rankItemId.split("-")[1]);
          const apiItem = apiItemsToQuery.results.find((ai) => ai.id === id);
          const redisEntity = redisEntities.find(
            (entity) => entity[redisIdKey] === id.toString(),
          );

          if (!redisEntity) {
            return null;
          }

          return createLeaderboardItem({
            id,
            earnings: redisEntity.earnings,
            xp: redisEntity.xp,
            rank,
            title: apiItem[titleField],
            image: apiItem[imageField],
            lost: redisEntity.lost,
            won: redisEntity.won,
          });
        })
        .filter(Boolean);
    }

    const pagination = {
      page,
      pageSize,
      total: totalLeaderboardItems,
    };
    return { leaderboardItems, pagination };
  },
};
