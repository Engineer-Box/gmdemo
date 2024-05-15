import { StrapiResponse, strapiApi } from "@/lib/strapi";
import { TeamResponse, TeamRoles, teamPopulate } from "../types";

export const leaveTeam = async (teamId: number) => {
  await strapiApi.request<StrapiResponse<TeamResponse>>(
    "get",
    `/teams/${teamId}/leave`,
    {
      params: {
        populate: teamPopulate,
      },
    }
  );
};
