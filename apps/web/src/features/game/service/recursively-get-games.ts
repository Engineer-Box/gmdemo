import { GameResponse } from "../types";
import { getGames } from "./get-games";

export const recursivelyGetGames = async (
  page: number = 1,
  prevGames: GameResponse[] = []
): Promise<GameResponse[]> => {
  const response = await getGames(page, {
    sort: "title",
    pageSize: 100,
  });

  const games = [...prevGames, ...response.data];

  if (page < response.meta.pagination.pageCount) {
    return recursivelyGetGames(page + 1, games);
  } else {
    return games;
  }
};
