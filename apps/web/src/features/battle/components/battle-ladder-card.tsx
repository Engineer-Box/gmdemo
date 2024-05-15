import { Skeleton } from "@/components/skeleton";
import { getGameModeDisplayValue, getRelativeStartTime } from "../util";
import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { Image } from "@/components/image";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { StrapiEntity, StrapiImage } from "@/types/strapi-types";
import { useState } from "react";
import { ViewBattleModal } from "./view-battle-modal";
import { BattleOverview, MatchOptionsWithoutRelations } from "../types";
import { Game } from "@/features/game/types";

export const BattleLadderCard = ({
  isMobile,
  battleOverview,
  gameAttributes,
  gameImage,
}: Partial<{
  isMobile: boolean;
  gameImage: StrapiImage | null;
  battleOverview: StrapiEntity<BattleOverview>;
  gameAttributes: Game["custom_attributes"];
}>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!battleOverview)
    return (
      <Skeleton className="px-3 py-3 rounded">
        <div className="w-11 h-11" />
      </Skeleton>
    );

  const startsIn = getRelativeStartTime(battleOverview.attributes.date);
  const teamSizeText = `${battleOverview.attributes.match_options.team_size}v${battleOverview.attributes.match_options.team_size}`;
  const seriesText = `Best of ${battleOverview.attributes.match_options.series}`;
  const gameMode = getGameModeDisplayValue(
    battleOverview.attributes.match_options.custom_attribute_inputs ?? [],
    gameAttributes ?? []
  );

  const region = battleOverview.attributes.match_options.region;

  const wagerText =
    battleOverview.attributes?.pot_amount &&
    battleOverview.attributes?.pot_amount > 0
      ? (
          battleOverview.attributes.pot_amount /
          2 /
          battleOverview.attributes.match_options.team_size /
          100
        ).toFixed(2) + " USDC"
      : "XP Match";

  const description = (
    isMobile
      ? [teamSizeText, seriesText, region, startsIn]
      : [teamSizeText, seriesText]
  ).join(" • ");

  const onClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {isModalOpen && (
        <ViewBattleModal
          battleId={battleOverview.id}
          closeModal={() => setIsModalOpen(false)}
          isInvitation={false}
        />
      )}
      <div className="px-3 py-3 rounded bg-brand-navy-light">
        {isMobile ? (
          <div className="flex items-center justify-between gap-4">
            <div className="w-[67%] xs:w-[70%]">
              <Text variant="label" className={"text-brand-white mb-2"}>
                {gameMode}
              </Text>
              <Text className={"text-xs"}>{description}</Text>
            </div>

            <div className="w-[33%] xs:w-[30%]">
              <Button onClick={onClick} className="w-full" title={wagerText} />
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-[53%] md:w-[56%]">
              <div className="flex items-center gap-4">
                <Image
                  className="overflow-hidden rounded w-11 h-11"
                  alt={"Battle image for " + battleOverview.id}
                  src={resolveStrapiImage(gameImage)}
                />
                <div>
                  <Text variant="label" className={"text-brand-white mb-1"}>
                    {gameMode}
                  </Text>
                  <Text className={"text-xs"}>{description}</Text>
                </div>
              </div>
            </div>
            <div className="w-[15%] md:w-[14%]">
              <Text className={"text-brand-white"}>{startsIn}</Text>
            </div>
            <div className="w-[15%] md:w-[14%]">
              <Text className={"text-brand-white"}>{region}</Text>
            </div>

            <div className="w-[15%] md:w-[14%]">
              <Button onClick={onClick} className="w-full" title={wagerText} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
