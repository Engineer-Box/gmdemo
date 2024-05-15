import { strapiApi } from "@/lib/strapi";
import { StrapiImage } from "@/types/strapi-types";

export type GameLeaderboardType = "game-profile" | "game-team";
export type GameLeaderboardPeriods = "year" | "month";

type GetLeaderboardParams = {
  game: number;
  page: number;
  pageSize: number;
  type: GameLeaderboardType;
  period?: GameLeaderboardPeriods;
  query?: string;
};

export type LeaderboardItemStats = {
  id: number;
  earnings: number;
  xp: number;
  rank?: number;
  lost: number;
  won: number;
};

export type GameLeaderboardItem = LeaderboardItemStats & {
  title: string;
  image: StrapiImage | null;
};

type GetGameLeaderboardResponse = {
  leaderboardItems: GameLeaderboardItem[];
  pagination: {
    total: number;
    pageSize: number;
    page: number;
  };
};

export const getGameLeaderboard = ({
  game,
  ...params
}: GetLeaderboardParams) => {
  return strapiApi.request<GetGameLeaderboardResponse>(
    "GET",
    `/leaderboard/${game}`,
    {
      params,
    }
  );
};
