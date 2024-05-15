import { AuthenticatedUser } from "@/hooks/use-auth";
import { GamerTagGameLabel } from "./gamer-tag-game-label";
import { Text } from "@/components/text";
import { IconButton } from "@/components/icon-button";

type GamerTagEditRowProps = {
  gamerTag: NonNullable<
    AuthenticatedUser["data"]["profile"]["gamer_tags"]["data"]
  >[number];
  onEditClick: () => void;
};

export const GamerTagEditRow = ({
  gamerTag,
  onEditClick,
}: GamerTagEditRowProps) => {
  const tagName = gamerTag.attributes.tag;

  return (
    <div className="flex items-center">
      <GamerTagGameLabel game={gamerTag.attributes.game} />
      <div className="flex gap-3 items-center">
        <Text
          variant="label"
          className="bg-brand-navy-light-accent-light py-1 px-3 rounded cursor-default max-w-52 overflow-hidden text-nowrap"
        >
          {tagName}
        </Text>
        <IconButton icon="edit" onClick={onEditClick} />
      </div>
    </div>
  );
};
