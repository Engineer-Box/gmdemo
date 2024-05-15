import { Text } from "@/components/text";
import { Image } from "@/components/image";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { toPascalCase } from "@/utils/to-pascal-case";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { PropsWithChildren, ReactNode, useMemo } from "react";
import { convertToOrdinal } from "@/utils/convert-to-ordinal";
import {
  TableCell,
  TableContainer,
  TableImage,
  TableRow,
} from "@/components/table";
import { Badge } from "@/components/badge";
import { GamerTag } from "../../gamer-tag/components/gamer-tag";
import { Skeleton } from "@/components/skeleton";
import { Clickable } from "@/components/clickable";
import { TeamResponse } from "../types";
import { LeaderboardItemStatsUtils } from "@/features/battle/util";

type TeamMembersTableProps = {
  team: TeamResponse;
};

const DesktopTableRows = ({
  teamProfiles,
}: {
  teamProfiles: NonNullable<
    TeamMembersTableProps["team"]["attributes"]["team_profiles"]["data"]
  >;
}) => {
  return (
    <div className="grid grid-cols-1">
      <TableRow>
        <TableCell className="w-[14%]">
          <Text className="">G Rank</Text>
        </TableCell>
        <TableCell className="w-[30%]">
          <Text>Player</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>Tag</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>Position</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>Earnings</Text>
        </TableCell>

        <TableCell className="w-[14%]" isCentered>
          <Text>XP</Text>
        </TableCell>
      </TableRow>
      {teamProfiles.map((profile, ind) => (
        <Clickable
          action={`/profile/${profile.attributes.profile.data?.id}`}
          key={ind}
        >
          <TableRow isDark={ind % 2 === 0} key={ind}>
            <TableCell className="w-[14%]">
              <Text>
                {LeaderboardItemStatsUtils.getRankText(
                  profile.attributes.leaderboard_item_stats
                )}
              </Text>
            </TableCell>

            <TableCell className="w-[30%]">
              <div className="flex items-center gap-4">
                <div className="w-[28px] h-[28px] relative rounded-sm overflow-hidden">
                  <Image
                    alt={profile.attributes.profile.data?.attributes.username!}
                    src={resolveStrapiImage(
                      profile.attributes.profile.data?.attributes.avatar ?? null
                    )}
                  />
                </div>
                <Text className="text-brand-white">
                  {profile.attributes.profile.data?.attributes.username!}
                </Text>
              </div>
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              {profile.attributes.gamer_tag.data?.attributes.tag && (
                <GamerTag
                  tag={profile.attributes.gamer_tag.data.attributes.tag}
                />
              )}
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <Text>{toPascalCase(profile.attributes.role)}</Text>
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <Text className={"text-brand-primary text-center"}>
                {LeaderboardItemStatsUtils.getEarningsText(
                  profile.attributes.leaderboard_item_stats
                )}
              </Text>
            </TableCell>

            <TableCell className="w-[14%]" isCentered>
              <Text className={"text-center"}>
                {LeaderboardItemStatsUtils.getXpText(
                  profile.attributes.leaderboard_item_stats
                )}
              </Text>
            </TableCell>
          </TableRow>
        </Clickable>
      ))}
    </div>
  );
};

const MobileTableRows = ({
  teamProfiles,
}: {
  teamProfiles: NonNullable<
    TeamMembersTableProps["team"]["attributes"]["team_profiles"]["data"]
  >;
}) => {
  return (
    <div className="grid grid-cols-1">
      <TableRow>
        <Text>Players</Text>
        <Text>Info</Text>
      </TableRow>
      {teamProfiles.map((profile, ind) => (
        <Clickable
          action={`/profile/${profile.attributes.profile.data?.id}`}
          key={ind}
        >
          <TableRow isDark={ind % 2 === 0}>
            <div className="flex items-center w-full gap-3">
              <TableImage
                alt={profile.attributes.profile.data?.attributes.username!}
                src={resolveStrapiImage(
                  profile.attributes.profile.data?.attributes.avatar ?? null
                )}
              />
              <div className="grid justify-between w-full grid-cols-2 gap-y-1 grow-1">
                <Text className="text-brand-white ">
                  {profile.attributes.profile.data?.attributes.username!}
                </Text>
                <Text className="justify-self-end">
                  {profile.attributes.gamer_tag.data?.attributes.tag && (
                    <GamerTag
                      tag={profile.attributes.gamer_tag.data.attributes.tag}
                    />
                  )}
                </Text>
                <Text className={"justify-end"}>
                  {LeaderboardItemStatsUtils.getRankText(
                    profile.attributes.leaderboard_item_stats,
                    true
                  )}
                </Text>
                <Text className={"justify-self-end"}>
                  {toPascalCase(profile.attributes.role)}
                </Text>
              </div>
            </div>
          </TableRow>
        </Clickable>
      ))}
    </div>
  );
};

export const TeamMembersTableSkeleton = () => (
  <div className="mt-8">
    <TableContainer title={<Skeleton dark className="w-96 h-8 max-w-[80%]" />}>
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
    </TableContainer>
  </div>
);

export const TeamMembersTable = ({ team }: TeamMembersTableProps) => {
  const isDesktop = useTailwindBreakpoint("md", { fallback: true });
  const tableTitle = `${isDesktop ? team.attributes.name : ""} Team members`;

  const teamProfiles = useMemo(
    () =>
      team.attributes.team_profiles.data?.filter(
        (tp) => !tp.attributes.is_pending
      ) ?? [],
    [team]
  );

  return (
    <TableContainer
      title={tableTitle}
      Right={
        <div className="flex gap-2">
          <Badge colorScheme={"emerald"}>
            W{" "}
            {LeaderboardItemStatsUtils.getWinCountText(
              team.attributes.leaderboard_item_stats
            )}
          </Badge>
          <Badge colorScheme={"rose"}>
            L{" "}
            {LeaderboardItemStatsUtils.getLostCountText(
              team.attributes.leaderboard_item_stats
            )}
          </Badge>
        </div>
      }
    >
      <>
        {isDesktop && <DesktopTableRows teamProfiles={teamProfiles} />}
        {!isDesktop && <MobileTableRows teamProfiles={teamProfiles} />}
      </>
    </TableContainer>
  );
};
