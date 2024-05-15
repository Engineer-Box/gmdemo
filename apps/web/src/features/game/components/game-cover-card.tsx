import * as AspectRatio from "@radix-ui/react-aspect-ratio";
import { Image } from "../../../components/image";

type GameCoverCardProps = {
  url: string;
};
export const GameCoverCard = ({ url }: GameCoverCardProps) => {
  return (
    <Image
      className={
        "aspect-[2/1] sm:aspect-[4/1] lg:aspect-[6/1] rounded overflow-hidden shadow-md"
      }
      src={url}
      alt={url}
    />
  );
};
