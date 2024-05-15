import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL);

export type LeaderboardType = "profile" | "game-profile" | "game-team";

export const getOnlineUserGameKey = (gameId: number | string) =>
  `online-user:game:${gameId}`;

export const getOnlineUserGameUserKey = (
  gameId: number | string,
  profileId: number | string,
) => `${getOnlineUserGameKey(gameId)}:user:${profileId}`;

export const matchSetKey = "match-set";

export const getRankingsKey = (
  entity: LeaderboardType,
  {
    rankingId,
    year,
    month,
  }: {
    rankingId?: number | string;
    year?: number;
    month?: number;
  },
) => {
  let key = `ranking:${entity}${rankingId ? ":" : ""}${
    rankingId ? rankingId : ""
  }`;
  if (year) {
    key += `:year:${year}`;
  }
  if (month) {
    key += `:month:${month}`;
  }
  return key;
};

export const getEntityKey = (
  entity: LeaderboardType,
  entityId: number | string,
  year?: number,
  month?: number,
) => {
  let key = `entity:${entity}:${entityId}`;

  if (year) {
    key += `:year:${year}`;
  }
  if (month) {
    key += `:month:${month}`;
  }

  return key;
};

export const getAllKeys = async (pattern: string) => {
  const recurse = async (keys: string[], cursor?: string) => {
    if (cursor === "0") {
      return keys;
    }
    const result = await redis.scan(
      cursor ?? "0",
      "MATCH",
      pattern,
      "COUNT",
      1000,
    );

    return await recurse([...keys, ...result[1]], result[0]);
  };

  return await recurse([]);
};

export const getKeysCount = async (pattern: string) => {
  const recurse = async (total: number, cursor?: string) => {
    if (cursor === "0") {
      return total;
    }
    const result = await redis.scan(
      cursor ?? "0",
      "MATCH",
      pattern,
      "COUNT",
      1000,
    );

    return await recurse(total + result[1].length, result[0]);
  };

  return await recurse(0);
};

export const getRedisHashes = async (entityIds: string[]) => {
  const pipeline = redis.pipeline();

  entityIds.forEach((entityId) => {
    pipeline.hgetall(entityId);
  });
  const response = await pipeline.exec();
  return response
    .map(([, item]) => item as any)
    .filter(
      (item) =>
        item !== null && typeof item === "object" && Object.keys(item).length,
    );
};
