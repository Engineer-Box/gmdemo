import { strapiApi } from "@/lib/strapi";
import { Game } from "../types";
import { gamePopulate } from "./shared";
import { StrapiEntity } from "@/types/strapi-types";

export type GetGameResponse = StrapiEntity<
  Game & {
    live: {
      players: number;
      matches: number;
    };
  }
>;

export const getGame = async (
  idOrSlug: number | string,
  bySlug: boolean = false
) => {
  const qp = bySlug ? "bySlug=true" : undefined;
  const gameResponse = await strapiApi.findOne<GetGameResponse>(
    "games",
    idOrSlug,
    {
      populate: gamePopulate,
    },
    qp
  );
  return gameResponse.data;
};
