import { strapiApi } from "@/lib/strapi";

import { TeamResponse, teamPopulate } from "../types";
import { StrapiError } from "@/utils/strapi-error";

export const getTeam = async (teamId: number) => {
  const team = await strapiApi.findOne<TeamResponse>("teams", teamId, {
    populate: teamPopulate,
  });

  if (!team || team.data.attributes.deleted) {
    throw new StrapiError(404, {
      name: "NotFoundError",
    });
  }

  if (team.data.attributes.team_profiles.data) {
    team.data.attributes.team_profiles.data =
      team.data.attributes.team_profiles.data?.filter(
        (tp) => !tp.attributes.deleted
      );
  }

  return team;
};
