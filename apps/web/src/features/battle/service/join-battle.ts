import { strapiApi } from "@/lib/strapi";

export const joinBattle = async ({
  teamProfileId,
  battleId,
  teamSelection,
}: {
  teamProfileId: number;
  battleId: number;
  teamSelection: number[];
}) => {
  return await strapiApi.request("post", `/battles/join/${battleId}`, {
    data: {
      data: {
        team_selection: teamSelection,
        team_profile_id: teamProfileId,
      },
    },
  });
};
