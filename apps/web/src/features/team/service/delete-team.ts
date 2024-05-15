import { strapiApi } from "@/lib/strapi";
import { TeamResponse, teamPopulate } from "../types";

export const deleteTeam = async (teamId: number) => {
  await strapiApi.delete<TeamResponse>("teams", teamId);
};
