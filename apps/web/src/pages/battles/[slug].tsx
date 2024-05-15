import { GameCoverCard } from "@/features/game/components/game-cover-card";
import { Heading } from "@/components/heading";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { StrapiError } from "@/utils/strapi-error";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { BattlesPageContent } from "@/features/battle/components/battles-page-content";
import { GameResponse } from "@/features/game/types";
import { recursivelyGetGames } from "@/features/game/service/recursively-get-games";
import { getGame } from "@/features/game/service/get-game";
import { ErrorPageProps } from "@/components/error-page";

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const games = await recursivelyGetGames();

    return {
      paths: games.map((game) => ({
        params: { slug: game.attributes.slug },
      })),
      fallback: "blocking",
    };
  } catch (error) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps = (async (context) => {
  try {
    const game = await getGame(context.params!.slug, true);
    return { props: { game }, revalidate: 600 };
  } catch (error) {
    if (StrapiError.isStrapiError(error)) {
      const status = error.error.status;

      return {
        redirect: {
          destination: `/${status}`,
          permanent: false,
        },
      };
    } else {
      return {
        redirect: {
          destination: `/500`,
          permanent: false,
        },
      };
    }
  }
}) satisfies GetStaticProps<
  {
    game: GameResponse;
  },
  { slug: string }
>;

export default function BattlesSlugPage({
  game,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { user, authStatus, signIn } = useAuth();

  if (authStatus === "unauthenticated") {
    signIn();
    return null;
  }

  return <div>{user && <BattlesPageContent user={user} game={game} />}</div>;
}
