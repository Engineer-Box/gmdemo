import { strapiApi } from "@/lib/strapi";

export const toggleFavouriteGame = async (gameId: number) => {
  await strapiApi.request("GET", `/profiles/favourite-game/${gameId}`, {});
};
