import { Image } from "@/components/image";
import { Text } from "@/components/text";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";

type GamerTagGameLabelProps = {
  game: NonNullable<
    NonNullable<
      AuthenticatedUser["data"]["profile"]["gamer_tags"]["data"]
    >[number]["attributes"]["game"]
  >;
};

export const GamerTagGameLabel = ({ game }: GamerTagGameLabelProps) => {
  const gameName = game.data?.attributes.title;
  const gameImage = resolveStrapiImage(game.data?.attributes.square_image);
  return (
    <div className="flex gap-6 items-center w-full">
      <Image
        className={"rounded-sm overflow-hidden w-8 h-8"}
        alt={`Tag image for ${gameName}`}
        src={gameImage}
      />
      <Text variant="label" className="mb-1">
        {gameName}
      </Text>
    </div>
  );
};
