import { StrapiResponse, strapiApi } from "@/lib/strapi";
import { TeamResponse, TeamRoles, teamPopulate } from "../types";

export const bulkUpdateTeamMembers = async (
  teamId: number,
  updatedTeam: { profile: number; role: TeamRoles }[]
) => {
  const teamUpdateResponse = await strapiApi.request<
    StrapiResponse<TeamResponse>
  >("post", `/teams/${teamId}/bulk-update-members`, {
    data: {
      data: updatedTeam,
    },
    params: {
      populate: teamPopulate,
    },
  });
  return teamUpdateResponse;
};
