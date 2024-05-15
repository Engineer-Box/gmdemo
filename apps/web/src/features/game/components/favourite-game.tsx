import { AuthenticatedUser } from "@/hooks/use-auth";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { Text } from "@/components/text";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { USER_QUERY_KEY } from "@/constants";
import { cn } from "@/utils/cn";
import { GameResponse } from "../types";
import { toggleFavouriteGame } from "@/features/profile/service/toggle-favourite-game";

type FavouriteGameProps = {
  currentUser: AuthenticatedUser;
  game: GameResponse;
};

export const FavouriteGame = ({ currentUser, game }: FavouriteGameProps) => {
  const isFavourite = !!currentUser.data.profile.favourite_games.data?.find(
    (fg) => fg.id === game.id
  );

  const { mutate: toggleFavouriteGameMutation, isLoading } =
    useOptimisticMutation<AuthenticatedUser, () => any>(
      () => toggleFavouriteGame(game.id),
      {
        queryKey: USER_QUERY_KEY,
        updateCache(_, previousValueDraft) {
          const previousFavourites =
            previousValueDraft?.data.profile?.favourite_games?.data ?? [];

          if (isFavourite) {
            // Remove it from the favourites
            if (previousValueDraft?.data.profile.favourite_games.data) {
              previousValueDraft!.data.profile.favourite_games.data =
                previousFavourites.filter((fg) => fg.id !== game.id);
            }
          } else {
            // Add it to the favourites
            previousValueDraft!.data.profile.favourite_games.data = [
              ...previousFavourites,
              game,
            ];
          }
          return previousValueDraft;
        },
      }
    );

  return (
    <div
      className={cn(
        "inline-flex gap-2 items-center cursor-pointer",
        isLoading && "opacity-50"
      )}
      onClick={() => {
        if (!isLoading) {
          toggleFavouriteGameMutation(undefined);
        }
      }}
    >
      <Text variant="p">{isFavourite ? "Remove" : "Favourite"}</Text>

      <div className="text-yellow-400">
        {isFavourite ? (
          <StarFilledIcon width={18} height={18} />
        ) : (
          <StarIcon width={18} height={18} />
        )}
      </div>
    </div>
  );
};
