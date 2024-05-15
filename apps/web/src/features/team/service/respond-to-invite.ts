import { StrapiResponse, strapiApi } from "@/lib/strapi";

export const respondToInvite = async (
  teamProfileId: number,
  accept: boolean
) => {
  if (accept) {
    await strapiApi.update("team-profiles", teamProfileId, {
      is_pending: false,
    });
  } else {
    await strapiApi.delete("team-profiles", teamProfileId);
  }
};
