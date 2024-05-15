import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useMemo, useState } from "react";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { Image } from "@/components/image";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Separator } from "@/components/separator";
import { Skeleton } from "@/components/skeleton";
import { Loader } from "@/components/loader";
import { GetBattleResponse } from "../../service/get-battle";
import { CancelBattleButton } from "./cancel-battle-button";
import { ReportScoreButton } from "./report-score-button";
import { Button } from "@/components/button";
import Link from "next/link";

type BattlePageHeaderProps = {
  battle?: GetBattleResponse;
  user?: AuthenticatedUser;
};

export const BattlePageHeader = ({ battle, user }: BattlePageHeaderProps) => {
  const isLoading = !battle || !user;
  const title = useMemo(() => {
    if (isLoading) return "";
    const gameTitle =
      battle.attributes.match_options.game.data?.attributes.title;
    const teamSize = `${battle.attributes.match_options.team_size}v${battle.attributes.match_options.team_size}`;
    const series = `Best of ${battle.attributes.match_options.series}`;

    return `${gameTitle}, ${teamSize}, ${series}`;
  }, [battle, isLoading]);

  const teamProfile = useMemo(() => {
    if (isLoading) return null;

    return getTeamProfileForUserBy(
      "gameId",
      battle?.attributes.match_options.game.data?.id!,
      user
    );
  }, [user, isLoading, battle?.attributes.match_options.game.data?.id]);

  const homeTeam = useMemo(
    () => battle?.attributes.match.data.attributes.home_team,
    [battle]
  );

  const awayTeam = useMemo(
    () => battle?.attributes.match.data.attributes.away_team,
    [battle]
  );

  const rulesUrl =
    battle?.attributes.match_options.game.data?.attributes.rules_url;

  const isCaptain = useMemo(() => {
    if (isLoading) return false;
    const isHomeTeamCaptain =
      homeTeam?.data?.attributes.team_selection_profiles.data.some(
        (tsp) =>
          tsp.attributes.is_captain &&
          teamProfile?.id &&
          tsp.attributes.team_profile.data?.id === teamProfile?.id
      );
    const isAwayTeamCaptain =
      awayTeam?.data?.attributes.team_selection_profiles.data?.some(
        (tsp) =>
          tsp.attributes.is_captain &&
          teamProfile?.id &&
          tsp.attributes.team_profile.data?.id === teamProfile?.id
      );

    return isHomeTeamCaptain ? "home" : isAwayTeamCaptain ? "away" : false;
  }, [isLoading, homeTeam, awayTeam, teamProfile?.id]);

  const topItems = useMemo(() => {
    if (isLoading) return [];

    return [
      battle.attributes.match_options.game.data?.attributes.title,
      battle.attributes.match_options.region,
      `Match ID: ${battle.attributes.match.data.id}`,
    ];
  }, [battle, isLoading]);

  const isCompleted = battle?.attributes.match.data.attributes.result;

  return (
    <>
      <div className="flex gap-4 flex-col sm:flex-row">
        <div className=" w-full sm:w-36 h-36 rounded overflow-hidden">
          <Loader
            isLoading={isLoading}
            Loading={<Skeleton type="image" className="w-full h-full" />}
          >
            <Image
              alt={`Battle image for battle ${battle?.id}`}
              src={resolveStrapiImage(
                battle?.attributes.match_options.game.data?.attributes
                  .square_image
              )}
            />
          </Loader>
        </div>

        <div className="flex flex-col gap-4 sm:justify-between sm:gap-0">
          <div className="flex flex-col gap-1.5">
            <Heading variant={"h1"} className={"mb-0"}>
              <Loader
                isLoading={isLoading}
                Loading={<Skeleton asSpan>12345689101112</Skeleton>}
              >
                {title}
              </Loader>
            </Heading>

            <Loader
              isLoading={isLoading}
              Loading={
                <Text>
                  <Skeleton asSpan className="w-[80%]">
                    Loading
                  </Skeleton>
                </Text>
              }
            >
              <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
                {topItems.map((item, ind) => (
                  <>
                    <Text key={item}>{item}</Text>
                    {ind !== topItems.length - 1 && (
                      <Separator
                        orientation="vertical"
                        className="min-h-6 max-h-6"
                      />
                    )}
                  </>
                ))}
              </div>
            </Loader>
          </div>
          {!isLoading && (
            <div className="flex flex-col gap-3 sm:gap-2 sm:flex-row">
              {isCaptain && !isCompleted && (
                <>
                  <ReportScoreButton battle={battle} side={isCaptain} />
                  <CancelBattleButton battle={battle} side={isCaptain} />
                </>
              )}

              {rulesUrl && !isCompleted && (
                <Link
                  className="w-full sm:w-auto"
                  href={rulesUrl}
                  target="_blank"
                >
                  <Button
                    variant={"unstyled"}
                    title="Rules"
                    className="w-full border border-brand-white text-brand-white active:border-brand-gray"
                  />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
