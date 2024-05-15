import { recursivelyGetGames } from "@/features/game/service/recursively-get-games";
import { useQuery } from "@tanstack/react-query";

export const useGetAllGames = (enabled: boolean = true) => {
  const {
    data: gamesQueryData,
    isLoading: gameQueryIsLoading,
    isError: gameQueryIsError,
  } = useQuery(["recursive-games"], () => recursivelyGetGames(), {
    staleTime: 1000 * 60 * 10,
    cacheTime: 1000 * 60 * 10,
    enabled,
  });

  return {
    gamesQueryData,
    gameQueryIsLoading,
    gameQueryIsError,
  };
};
