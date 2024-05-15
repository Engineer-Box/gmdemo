import { cn } from "@/utils/cn";
import { GameLeaderboardItem } from "../../service/get-game-leaderboard";
import { LeaderboardRowLayout } from "./leaderboad-row-layout";
import { Text } from "@/components/text";
import { TableImage, TableImageSkeleton } from "@/components/table";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { Skeleton } from "@/components/skeleton";
import { LeaderboardItemStatsUtils } from "../../util";

export const LeaderboardRow = ({
  item,
  isDark,
}: {
  item?: GameLeaderboardItem;
  isDark?: boolean;
}) =>
  item ? (
    <LeaderboardRowLayout
      isDark={isDark}
      className={cn("relative border-l-[6px]", {
        "border-brand-primary": item.rank === 1,
        "border-teal-400": item.rank === 2,
        "border-red-500/95": item.rank === 3,
      })}
    >
      <Text variant="p" className={"relative z-10"}>
        {item.rank ?? "NA"}
      </Text>
      <div className="flex gap-4 items-center relative z-10">
        <TableImage
          src={resolveStrapiImage(item.image)}
          alt={`Image for ${item.id}`}
        />
        <Text variant="p" className={"text-brand-white relative font-semibold"}>
          {item.title}
        </Text>
      </div>
      <Text variant="p" className={"text-teal-400 "}>
        {LeaderboardItemStatsUtils.getWinCountText(item)}
      </Text>
      <Text variant="p" className={"text-red-500/95 "}>
        {LeaderboardItemStatsUtils.getLostCountText(item)}
      </Text>
      <Text variant="p" className={"text-brand-primary "}>
        {LeaderboardItemStatsUtils.getEarningsText(item)}
      </Text>
      <Text variant="p">{LeaderboardItemStatsUtils.getXpText(item)}</Text>
      <div
        className={cn(
          "absolute z-0 inset-0 bg-gradient-to-r to-[12%] md:to-[18%]",
          {
            "from-brand-primary/25 to-transparent": item.rank === 1,
            "from-teal-400/25 to-transparent": item.rank === 2,
            "from-red-500/25 to-transparent": item.rank === 3,
          }
        )}
      />
    </LeaderboardRowLayout>
  ) : (
    <LeaderboardRowLayout isDark={isDark}>
      <Skeleton className="w-[50%] m-auto h-3" dark={!isDark} />
      <div className="flex gap-3 items-center">
        <TableImageSkeleton />
        <Skeleton className="w-[80%] h-4" dark={!isDark} />
      </div>
      <Skeleton className="w-[50%] m-auto h-3" dark={!isDark} />
      <Skeleton className="w-[50%] m-auto h-3" dark={!isDark} />
      <Skeleton className="w-[50%] m-auto h-3" dark={!isDark} />
      <Skeleton className="w-[50%] m-auto h-3" dark={!isDark} />
    </LeaderboardRowLayout>
  );
