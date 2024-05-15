import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, ReactNode, useEffect, useState } from "react";
import {
  GameLeaderboardPeriods,
  GameLeaderboardType,
  getGameLeaderboard,
} from "../../service/get-game-leaderboard";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/button";
import { TableContainer, TableRow } from "@/components/table";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { Text } from "@/components/text";
import { Loader } from "@/components/loader";
import { LeaderboardRowLayout } from "./leaderboad-row-layout";
import { LeaderboardRow } from "./leaderboard-row";
import {
  LeaderboardFilterSection,
  useLeaderboardFilters,
} from "./leaderboard-filter-section";

const PAGE_SIZE = 8;

export const GameLeaderboardTab = ({ gameId }: { gameId: number }) => {
  const [page, setPage] = useState(1);

  const [numberOfLoadingSkeletons, setNumberOfLoadingSkeletons] =
    useState(PAGE_SIZE);

  const {
    period,
    setPeriod,
    leaderboardType,
    setLeaderboardType,
    query,
    setQuery,
  } = useLeaderboardFilters();

  const { data, isLoading } = useQuery(
    ["get-game-leaderboard", gameId, leaderboardType, page, query, period],
    () =>
      getGameLeaderboard({
        game: gameId,
        page,
        type: leaderboardType,
        pageSize: PAGE_SIZE,
        period,
        query,
      })
  );

  useEffect(() => {
    if (data) {
      setNumberOfLoadingSkeletons(Math.max(data.leaderboardItems.length, 3));
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-6 mt-6">
      <TableContainer
        tableRowClassName="px-5 md:px-8 py-2 md:py-2"
        title={
          <LeaderboardFilterSection
            period={period}
            setPeriod={setPeriod}
            query={query}
            setQuery={setQuery}
            leaderboardType={leaderboardType}
            setLeaderboardType={setLeaderboardType}
          />
        }
      >
        <LeaderboardRowLayout>
          <Text variant="p">Rank</Text>
          <Text variant="p">
            {leaderboardType === "game-profile" ? "Player" : "Team"}
          </Text>
          <Text variant="p">Wins</Text>
          <Text variant="p">Losses</Text>
          <Text variant="p">Earnings</Text>
          <Text variant="p">XP</Text>
        </LeaderboardRowLayout>

        <Loader
          isLoading={isLoading}
          Loading={
            <>
              {Array.from({ length: numberOfLoadingSkeletons }).map(
                (_, ind) => (
                  <LeaderboardRow
                    key={ind}
                    item={undefined}
                    isDark={ind % 2 === 0}
                  />
                )
              )}
            </>
          }
        >
          <>
            {data?.leaderboardItems.map((leaderboardItem, ind) => (
              <LeaderboardRow
                key={`${leaderboardItem.id}-${leaderboardItem.xp}-${leaderboardItem.rank}-${leaderboardType}`}
                item={leaderboardItem}
                isDark={ind % 2 === 0}
              />
            ))}
            {data?.leaderboardItems.length === 0 && (
              <TableRow isDark>
                <p className="text-brand-gray">No results</p>
              </TableRow>
            )}
          </>
        </Loader>
      </TableContainer>
      <div className="flex justify-end">
        <Pagination
          page={page}
          setPage={setPage}
          maxPages={data ? data?.pagination.total / PAGE_SIZE : 1}
        />
      </div>
    </div>
  );
};
