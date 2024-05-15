import { Pagination } from "@/components/pagination";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Text } from "@/components/text";
import { Icon } from "@/components/icon";
import { useRouter } from "next/router";
import { BattleLadderCard } from "./battle-ladder-card";
import { getJoinableBattles } from "../service/get-joinable-battles";
import { GameResponse } from "@/features/game/types";

type BattlesLadderTabProps = {
  game: GameResponse;
  isMobile?: boolean;
};

const PAGE_SIZE = 5;

export const BattlesLadderTab = ({ game, isMobile }: BattlesLadderTabProps) => {
  const { user } = useAuth();
  const [battleViewModal, setBattleViewModal] = useState<null | number>(null);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const teamProfile = useMemo(
    () => getTeamProfileForUserBy("gameId", game.id, user),
    [game.id, user]
  );

  const teamId = teamProfile?.attributes.team.data?.id;

  const {
    data: battles,
    isError: battlesIsError,
    isLoading: battlesIsLoading,
  } = useQuery(
    ["get-joinable-battles", game.id, teamId, page],
    () =>
      getJoinableBattles({
        gameId: game.id,
        teamId,
        pageNumber: page,
        pageSize: PAGE_SIZE,
      }),
    {
      refetchInterval: 5000,
      cacheTime: 0,
      keepPreviousData: false,
      refetchOnWindowFocus: false,
    }
  );

  const battleInView = useMemo(
    () =>
      battleViewModal
        ? battles?.data.find((b) => b.id === battleViewModal) ?? null
        : null,
    [battleViewModal, battles]
  );

  useEffect(() => {
    if (battlesIsError) {
      router.push("/500");
    }
  }, [battlesIsError]);

  return (
    <div>
      <div>
        {!isMobile && (
          <div className="flex items-center">
            <div className="w-[53%] md:w-[56%]">
              <Text>Game & Mode</Text>
            </div>
            <div className="contents md:*:-ml-1">
              <div className="w-[15%] md:w-[14%]">
                <div className="text-brand-gray flex gap-2 items-center ">
                  <Icon icon="clock" size={16} />
                  <Text> Starts in</Text>
                </div>
              </div>
              <div className="w-[15%] md:w-[14%]">
                <Text>Region</Text>
              </div>

              <div className="w-[15%] md:w-[14%]">
                <Text>Wager</Text>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {battlesIsLoading ? (
            <>
              <BattleLadderCard />
              <BattleLadderCard />
              <BattleLadderCard />
              <BattleLadderCard />
            </>
          ) : (
            battles?.data.map((battle) => (
              <BattleLadderCard
                gameImage={game.attributes.square_image.data?.attributes}
                key={battle.id}
                isMobile={isMobile}
                battleOverview={battle}
                gameAttributes={game.attributes.custom_attributes ?? []}
              />
            ))
          )}
        </div>

        {!battlesIsLoading && !battles?.data.length && (
          <Text className={"mt-2"}>
            There are no joinable battles at the moment.
          </Text>
        )}
      </div>

      <Pagination
        className="mt-6 justify-end"
        page={page}
        setPage={setPage}
        maxPages={battles?.meta.pagination.pageCount ?? 1}
      />
    </div>
  );
};
