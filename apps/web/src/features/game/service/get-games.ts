import { strapiApi } from "@/lib/strapi";
import { GameResponse, GetGamesSort } from "../types";
import { gamePopulate } from "./shared";

export const getGames = async (
  page: number,
  options: Partial<{
    sort: GetGamesSort;
    pageSize: number;
  }> = {}
) => {
  const gamesResponse = await strapiApi.find<GameResponse>("games", {
    sort: options.sort === "date" ? "createdAt:asc" : "title:asc",
    populate: gamePopulate,
    pagination: {
      page,
      pageSize: options.pageSize ?? 25,
    },
  });

  return gamesResponse;
};
