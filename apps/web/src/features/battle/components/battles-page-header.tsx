import { Heading } from "@/components/heading";
import { Show } from "@/components/show";
import { Text } from "@/components/text";
import { FavouriteGame } from "@/features/game/components/favourite-game";
import { GameCoverCard } from "@/features/game/components/game-cover-card";
import { GetGameResponse } from "@/features/game/service/get-game";
import { GameResponse } from "@/features/game/types";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";

type BattlesPageHeaderProps = {
  user: AuthenticatedUser;
  game: GetGameResponse;
};

export const BattlesPageHeader = ({ game, user }: BattlesPageHeaderProps) => {
  const isTablet = useTailwindBreakpoint("sm");
  const playersOnline = game.attributes.live.matches;
  const liveMatches = game.attributes.live.matches;
  const playersText = `Player${playersOnline !== 1 ? "s" : ""}${
    isTablet ? " online" : ""
  }`;
  const matchesText = `${isTablet ? "Live match" : "Match"}${
    liveMatches !== 1 ? "es" : ""
  }`;

  return (
    <div className="mb-12">
      <GameCoverCard url={resolveStrapiImage(game.attributes.cover_image)} />
      <Heading variant="h1" className="mt-6 mb-2">
        {game.attributes.title}
      </Heading>

      <div className="flex gap-3 items-center">
        <div className="flex gap-1 items-center">
          <Text variant="p" className={"text-brand-white"}>
            <span className="text-brand-primary font-bold">
              {playersOnline}
            </span>{" "}
            {playersText}
          </Text>
          <div className="text-brand-white">•</div>
          <Text variant="p" className={"text-brand-white"}>
            <span className="text-brand-primary font-bold">{liveMatches}</span>{" "}
            {matchesText}
          </Text>
        </div>
        <FavouriteGame currentUser={user} game={game} />
      </div>
    </div>
  );
};
