import { StrapiResponse, strapiApi } from "@/lib/strapi";
import { TeamResponse, TeamRoles, teamPopulate } from "../types";

export const updateTeam = async (
  teamId: number,
  data: Partial<{
    name: string;
    image?: number;
  }>
) => {
  const updatedTeam = await strapiApi.update<TeamResponse>(
    "teams",
    teamId,
    data,
    {
      populate: teamPopulate,
    }
  );

  return updatedTeam;
};
