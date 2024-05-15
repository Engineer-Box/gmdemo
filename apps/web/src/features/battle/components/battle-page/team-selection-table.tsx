import { Image } from "@/components/image";
import { GetBattleResponse } from "../../service/get-battle";
import {
  TableCell,
  TableContainer,
  TableImage,
  TableRow,
} from "@/components/table";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { Badge } from "@/components/badge";
import { Text } from "@/components/text";
import { GamerTag } from "@/features/gamer-tag/components/gamer-tag";
import { Skeleton } from "@/components/skeleton";
import { LeaderboardItemStatsUtils } from "../../util";
import { Clickable } from "@/components/clickable";

// TODO: Might be easier to just pass in the battle + whether to show the home or away team
type TeamSelectionTableProps = {
  teamSelection?:
    | GetBattleResponse["attributes"]["match"]["data"]["attributes"]["home_team"]
    | GetBattleResponse["attributes"]["match"]["data"]["attributes"]["away_team"];
  gameId?: number;
  winningTeamId?: number;
};

export const TeamSelectionTable = ({
  teamSelection,
  gameId,
  winningTeamId,
}: TeamSelectionTableProps) => {
  if (!teamSelection || !gameId) {
    return <Skeleton className="w-full h-56" />;
  }

  const isWinningTeamId =
    teamSelection?.data?.attributes.team.data?.id === winningTeamId;

  const showWinnersBadge = typeof winningTeamId === "number" && isWinningTeamId;
  const showLosersBadge = typeof winningTeamId === "number" && !isWinningTeamId;

  return (
    <div className="w-full">
      <TableContainer
        tableRowClassName="my-1 md:px-6"
        title={
          <div className="flex items-center gap-3">
            <div className="w-12 aspect-square rounded overflow-hidden">
              <Image
                alt="Home team image"
                src={resolveStrapiImage(
                  teamSelection?.data?.attributes.team.data?.attributes.image
                )}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-3 items-center">
                <Clickable
                  action={`/team/${teamSelection?.data?.attributes.team.data?.id}`}
                >
                  <p className="text-2xl font-accent text-brand-white cursor-pointer">
                    {teamSelection?.data?.attributes.team.data?.attributes.name}
                  </p>
                </Clickable>
                {showWinnersBadge && (
                  <Badge colorScheme="emerald">Winner</Badge>
                )}
                {showLosersBadge && <Badge colorScheme="rose">Loser</Badge>}
              </div>
              <div className="flex gap-2">
                <Badge colorScheme="emerald">
                  W{" "}
                  {LeaderboardItemStatsUtils.getWinCountText(
                    teamSelection.data?.attributes.team.data?.attributes
                      .leaderboard_item_stats
                  )}
                </Badge>
                <Badge colorScheme="rose">
                  L
                  {LeaderboardItemStatsUtils.getLostCountText(
                    teamSelection.data?.attributes.team.data?.attributes
                      .leaderboard_item_stats
                  )}
                </Badge>
              </div>
            </div>
          </div>
        }
        Right={
          <div className="flex flex-col items-center">
            <Text variant="p">Rank</Text>
            <p className="text-lg font-accent text-brand-white">
              {LeaderboardItemStatsUtils.getRankText(
                teamSelection.data?.attributes.team.data?.attributes
                  .leaderboard_item_stats
              )}
            </p>
          </div>
        }
      >
        <TableRow className="md:px-6">
          <TableCell className={"w-[20%]"}>
            <Text variant="p">G Rank</Text>
          </TableCell>
          <TableCell className={"w-[40%]"}>
            <Text variant="p">Player</Text>
          </TableCell>
          <TableCell className={"w-[20%]"}>
            <Text variant="p">Tag</Text>
          </TableCell>
          <TableCell className={"w-[20%]"}>
            <Text variant="p">Earnings</Text>
          </TableCell>
        </TableRow>

        {teamSelection?.data?.attributes.team_selection_profiles.data.map(
          (tsp, ind) => {
            const profileImage =
              tsp.attributes.team_profile.data?.attributes.profile.data
                ?.attributes.avatar;
            const username =
              tsp.attributes.team_profile.data?.attributes.profile.data
                ?.attributes.username;
            const tagForGame =
              tsp.attributes.team_profile.data?.attributes.profile.data?.attributes.gamer_tags.data?.find(
                (gt) => gt.attributes.game.data?.id === gameId
              )?.attributes.tag;

            const rank = LeaderboardItemStatsUtils.getRankText(
              tsp.attributes.team_profile.data?.attributes
                .leaderboard_item_stats
            );
            const earnings = LeaderboardItemStatsUtils.getEarningsText(
              tsp.attributes.team_profile.data?.attributes
                .leaderboard_item_stats
            );
            return (
              <TableRow key={ind} isDark={ind % 2 === 0} className="md:px-6">
                <TableCell className={"w-[20%]"}>
                  <Text variant="p">{rank}</Text>
                </TableCell>
                <TableCell className={"w-[40%]"}>
                  <div className="flex gap-3 items-center">
                    <div className="aspect-square w-8 rounded overflow-hidden">
                      <Image
                        src={resolveStrapiImage(profileImage)}
                        alt="Profile image"
                      />
                    </div>
                    <Text variant="p" className={"text-brand-white"}>
                      {username}
                    </Text>
                  </div>
                </TableCell>
                <TableCell className={"w-[20%]"}>
                  <GamerTag tag={tagForGame!} className="text-brand-white" />
                </TableCell>
                <TableCell isCentered className={"w-[20%]"}>
                  <Text variant="p" className={"text-emerald-400"}>
                    {earnings}
                  </Text>
                </TableCell>
              </TableRow>
            );
          }
        )}
      </TableContainer>
    </div>
  );
};
