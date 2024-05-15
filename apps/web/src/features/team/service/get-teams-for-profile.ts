import { strapiApi } from "@/lib/strapi";
import { TeamResponse, teamPopulate } from "../types";

export const getTeamsForProfile = async (
  profileId: number,
  {
    page,
    pageSize,
  }: Partial<{
    page: number;
    pageSize: number;
  }> = {}
) => {
  const teams = await strapiApi.find<TeamResponse>("teams", {
    populate: teamPopulate,
    pagination: {
      page: page ?? 1,
      pageSize: pageSize ?? 100,
    },
    filters: {
      team_profiles: {
        profile: profileId,
        deleted: { $ne: true },
        is_pending: false,
      },
    },
  });

  return teams;
};
