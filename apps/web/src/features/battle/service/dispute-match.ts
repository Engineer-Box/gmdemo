import { strapiApi } from "@/lib/strapi";

export const disputeMatch = async (matchId: number) => {
  await strapiApi.request("GET", `/matches/open-dispute/${matchId}`, {});
};
