import { useQuery } from "@tanstack/react-query";
import { Select } from "@/components/select";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useGetAllGames } from "@/features/gamer-tag/hooks/use-get-all-games";
import { GameResponse } from "../types";

export type GameSelectProps = {
  selectedGame: GameResponse | null;
  setSelectedGame: React.Dispatch<React.SetStateAction<GameResponse | null>>;
  gameIdsToExclude?: number[];
  isDisabled?: boolean;
  fixedGameId?: number;
  gameSelectError?: boolean | string;
};

export const useGameSelect = () => {
  const [selectedGame, setSelectedGame] = useState<GameResponse | null>(null);
  const [gameSelectError, setGameSelectError] = useState<boolean | string>(
    false
  );

  return {
    selectedGame,
    setSelectedGame,
    gameSelectError,
    setGameSelectError,
  };
};

export const GameSelect = ({
  selectedGame,
  setSelectedGame,
  gameIdsToExclude,
  fixedGameId,
  gameSelectError,
  isDisabled = false,
}: GameSelectProps) => {
  const [stringifiedGameId, setStringifiedGameId] = useState<string | null>(
    () => fixedGameId?.toString() ?? selectedGame?.id.toString() ?? null
  );

  const { gamesQueryData, gameQueryIsLoading, gameQueryIsError } =
    useGetAllGames(!isDisabled);
  const router = useRouter();

  useEffect(() => {
    if (gameQueryIsError) {
      router.push("/500");
    }
  }, [gameQueryIsError]);

  const setSelectedGameFromId = (id: number) => {
    const selectedGame = gamesQueryData?.find((game) => game.id === id) ?? null;
    setSelectedGame(selectedGame);
  };

  useEffect(() => {
    if (!gamesQueryData) return;

    if (stringifiedGameId || fixedGameId) {
      setSelectedGameFromId(
        fixedGameId ? fixedGameId : parseInt(stringifiedGameId!)
      );
    }
  }, [stringifiedGameId, gamesQueryData]);

  const stringifiedGameOptionIds = useMemo(() => {
    const gamesQueryWithoutExcludedGames = gamesQueryData
      ? gamesQueryData?.filter((game) => !gameIdsToExclude?.includes(game.id))
      : [];

    return gamesQueryWithoutExcludedGames.map((game) => game.id.toString());
  }, [gamesQueryData, gameIdsToExclude]);

  const getGameSelectLabelFromStringifiedGameId = useCallback(
    (stringId: string) => {
      const id = parseInt(stringId);
      const game = gamesQueryData?.find((game) => game.id === id);

      return game?.attributes.title ?? "";
    },
    [gamesQueryData]
  );

  return (
    <Select
      disabled={
        gameQueryIsLoading || gameQueryIsError || isDisabled || !!fixedGameId
      }
      options={stringifiedGameOptionIds}
      setValue={setStringifiedGameId}
      error={gameSelectError}
      value={stringifiedGameId}
      getLabel={getGameSelectLabelFromStringifiedGameId}
    />
  );
};
