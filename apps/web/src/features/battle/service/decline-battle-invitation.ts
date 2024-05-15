import { strapiApi } from "@/lib/strapi";

export const declineBattleInvitation = async (battleId: number) => {
  await strapiApi.request("GET", `/battles/decline-invitation/${battleId}`, {});
};
