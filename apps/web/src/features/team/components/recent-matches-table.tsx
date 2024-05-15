import { Text } from "@/components/text";
import { Image } from "@/components/image";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { toPascalCase } from "@/utils/to-pascal-case";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import {
  TableCell,
  TableContainer,
  TableImage,
  TableRow,
} from "@/components/table";
import { GamerTag } from "../../gamer-tag/components/gamer-tag";
import { Skeleton } from "@/components/skeleton";
import { Clickable } from "@/components/clickable";
import { useQuery } from "@tanstack/react-query";
import {
  GetConfirmedBattlesForTeam,
  getConfirmedBattlesForTeam,
} from "@/features/battle/service/get-confirmed-battles-for-team";
import { cn } from "@/utils/cn";
import { Loader } from "@/components/loader";
import { toUsdString } from "@/utils/to-usd-string";
import { LeaderboardItemStatsUtils } from "@/features/battle/util";
import { Badge } from "@/components/badge";

type MatchesTableProps = {
  teamId: number;
};

type MatchRow = {
  teamRank: string;
  matchId: number;
  battleId: number;
  opponentTeam: NonNullable<
    NonNullable<
      NonNullable<
        NonNullable<
          GetConfirmedBattlesForTeam["attributes"]["match"]["data"]
        >["attributes"]["home_team"]["data"]
      >
    >["attributes"]["team"]
  >;
  result: "win" | "loss" | "pending" | "disputed";
  dateString: string;
  xpString: string;
  wagerString?: string;
};

const ResultText = ({ result }: { result: MatchRow["result"] }) =>
  result === "disputed" ? (
    <Badge colorScheme={"warning"}> Disputed </Badge>
  ) : (
    <Text
      variant="p"
      className={cn(
        result === "win" && "text-teal-400",
        result === "loss" && "text-red-500/95"
      )}
    >
      {result === "pending" ? "--" : toPascalCase(result)}
    </Text>
  );

const MatchRowLink = ({
  battleId,
  children,
}: PropsWithChildren<{ battleId: number }>) => (
  <Clickable action={`/battle/${battleId}`}>{children}</Clickable>
);

const DesktopTableRows = ({ rows }: { rows: MatchRow[] }) => {
  return (
    <div className="grid grid-cols-1">
      <TableRow>
        <TableCell className="w-[14%]">
          <Text className="">Rank</Text>
        </TableCell>
        <TableCell className="w-[30%]">
          <Text>Team</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>Result</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>Match time</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>Wagered</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>XP Result</Text>
        </TableCell>
      </TableRow>
      {rows.map((row, ind) => (
        <MatchRowLink key={row.battleId} battleId={row.battleId}>
          <TableRow isDark={ind % 2 === 0} key={ind}>
            <TableCell className="w-[14%]">
              <Text>{row.teamRank}</Text>
            </TableCell>

            <TableCell className="w-[30%]">
              <div className="flex items-center gap-4">
                <div className="w-[28px] h-[28px] relative rounded-sm overflow-hidden">
                  <Image
                    alt={
                      row.opponentTeam.data?.attributes.name ??
                      "Team image" + ind
                    }
                    src={resolveStrapiImage(
                      row.opponentTeam.data?.attributes.image ?? null
                    )}
                  />
                </div>
                <Text className="text-brand-white">
                  {row.opponentTeam.data?.attributes.name}
                </Text>
              </div>
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <ResultText result={row.result} />
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <Text variant="p">{row.dateString}</Text>
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <Text variant="p" className={"text-brand-primary"}>
                {row.wagerString}
              </Text>
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <Text variant="p">
                {row.result === "pending" ? "--" : row.xpString}
              </Text>
            </TableCell>
          </TableRow>
        </MatchRowLink>
      ))}
    </div>
  );
};

const MobileTableRows = ({ rows }: { rows: MatchRow[] }) => {
  return (
    <div className="grid grid-cols-1">
      <TableRow>
        <Text>Team</Text>
        <Text>Result</Text>
      </TableRow>
      {rows.map((row, ind) => (
        <MatchRowLink key={row.battleId} battleId={row.battleId}>
          <TableRow key={ind} isDark={ind % 2 === 0}>
            <div className="flex items-center w-full gap-3">
              <TableImage
                alt={
                  row.opponentTeam.data?.attributes.name ?? "Team image" + ind
                }
                src={resolveStrapiImage(
                  row.opponentTeam.data?.attributes.image ?? null
                )}
              />
              <div className="grid justify-between w-full grid-cols-2 gap-y-1 grow-1">
                <Text className="text-brand-white">
                  {row.opponentTeam.data?.attributes.name}
                </Text>
                <div className="justify-self-end">
                  <ResultText result={row.result} />
                </div>
                <Text className={"justify-end"}>{row.xpString}</Text>
                <Text className={"justify-self-end text-brand-primary"}>
                  {row.wagerString}
                </Text>
              </div>
            </div>
          </TableRow>
        </MatchRowLink>
      ))}
    </div>
  );
};

export const RecentMatchesTable = ({ teamId }: MatchesTableProps) => {
  const isDesktop = useTailwindBreakpoint("md", { fallback: true });
  const pageSize = 5;
  const page = 1;

  const { data, isLoading } = useQuery(
    ["get-confirmed-battles-for-team", teamId, pageSize, page],
    () =>
      getConfirmedBattlesForTeam(teamId, {
        page,
        pageSize,
      }),
    {}
  );

  const matches: MatchRow[] = useMemo(() => {
    if (!data) return [];

    return data.data.map((battle) => {
      const isHomeTeam =
        battle.attributes.match.data?.attributes.home_team.data?.attributes.team
          .data?.id === teamId;

      const opponentKey = isHomeTeam ? "away_team" : "home_team";
      const currentKey = isHomeTeam ? "home_team" : "away_team";

      const opponentTeam =
        battle.attributes.match.data?.attributes[opponentKey].data?.attributes
          .team;
      const currentTeamSelection =
        battle.attributes.match.data?.attributes[currentKey].data?.attributes;

      const result = battle.attributes.match.data?.attributes.result;
      const didWin =
        result &&
        ((result === "home" && isHomeTeam) ||
          (result === "away" && !isHomeTeam));

      const resultString = result
        ? didWin
          ? "win"
          : "loss"
        : battle.attributes.match.data?.attributes.dispute?.data?.id
          ? "disputed"
          : "pending";

      const date = new Date(battle.attributes.date);
      const localDateString = date.toLocaleDateString("en-GB", {
        month: "2-digit",
        day: "numeric",
        year: "2-digit",
      });
      const localTimeString = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const dateString = `${localTimeString} ${localDateString}`;
      const xpString = `${currentTeamSelection?.xp! > 0 ? "+" : ""}${
        currentTeamSelection?.xp! / 10
      } XP`;

      const teamRank = LeaderboardItemStatsUtils.getRankText(
        currentTeamSelection?.team.data?.attributes.leaderboard_item_stats
      );

      const wagerString = toUsdString(battle.attributes.pot_amount ?? 0, false);

      const match: MatchRow = {
        matchId: battle.attributes.match.data?.id!,
        battleId: battle.id!,
        teamRank,
        opponentTeam: opponentTeam!,
        dateString,
        xpString,
        wagerString,
        result: resultString,
      };

      return match;
    });
  }, [data, teamId]);

  if (!isLoading && matches.length === 0) {
    return null;
  }

  return (
    <TableContainer title={"Matches"}>
      <Loader
        isLoading={isLoading}
        Loading={
          <>
            <TableRow>
              <Skeleton className="w-[80%] h-3" dark />
            </TableRow>
            <TableRow isDark>
              <Skeleton className="w-[60%] h-3" dark />
            </TableRow>
            <TableRow>
              <Skeleton className="w-[80%] h-3" dark />
            </TableRow>
            <TableRow isDark>
              <Skeleton className="w-[60%] h-3" dark />
            </TableRow>
          </>
        }
      >
        <>
          {isDesktop && <DesktopTableRows rows={matches} />}
          {!isDesktop && <MobileTableRows rows={matches} />}
        </>
      </Loader>
    </TableContainer>
  );
};
