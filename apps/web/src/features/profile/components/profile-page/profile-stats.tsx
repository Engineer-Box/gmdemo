import { LeaderboardItemStats } from "@/features/battle/service/get-game-leaderboard";
import { ProfileStatBox } from "./profile-stat-box";
import { LeaderboardItemStatsUtils } from "@/features/battle/util";
import { toUsdString } from "@/utils/to-usd-string";
import { PropsWithChildren } from "react";
import { Skeleton } from "@/components/skeleton";

type ProfileStatsProps = {
  stats?: LeaderboardItemStats;
};

const ProfileStatsContainer = ({ children }: PropsWithChildren<{}>) => (
  <div className="grid px-2 grid-cols-2 sm:grid-cols-4 gap-5 my-10">
    {children}
  </div>
);

export const ProfileStatsSkeleton = () => (
  <ProfileStatsContainer>
    <Skeleton className="-full h-32" />
    <Skeleton className="-full h-32" />
    <Skeleton className="-full h-32" />
    <Skeleton className="-full h-32" />
  </ProfileStatsContainer>
);

export const ProfileStats = ({ stats }: ProfileStatsProps) => {
  if (!stats) {
    return null;
  }
  const totalGamesPlayed =
    LeaderboardItemStatsUtils.getLostCountText(stats) +
    LeaderboardItemStatsUtils.getWinCountText(stats);

  return (
    <ProfileStatsContainer>
      <ProfileStatBox
        title="Rank"
        description={`${Math.round(
          LeaderboardItemStatsUtils.getXpText(stats)
        )} XP`}
        stat={LeaderboardItemStatsUtils.getRankText(stats)}
        colorScheme={"violet"}
      />
      <ProfileStatBox
        title="Earnings"
        description={`${toUsdString(
          Math.round(
            Number.isNaN(stats.earnings / totalGamesPlayed)
              ? 0
              : stats.earnings / totalGamesPlayed
          )
        )} per game`}
        stat={LeaderboardItemStatsUtils.getEarningsText(stats)}
        colorScheme={"emerald"}
      />
      <ProfileStatBox
        title="Record"
        description={`${totalGamesPlayed} games played`}
        stat={`${LeaderboardItemStatsUtils.getWinCountText(
          stats
        )}-${LeaderboardItemStatsUtils.getLostCountText(stats)}`}
        colorScheme={"white"}
      />
      <ProfileStatBox
        title="Win rate"
        description={"All time"}
        stat={LeaderboardItemStatsUtils.getWinRateText(stats)}
        colorScheme={"violet"}
      />
    </ProfileStatsContainer>
  );
};
