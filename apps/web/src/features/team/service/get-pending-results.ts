import { StrapiResponse, strapiApi } from "@/lib/strapi";

export const getPendingResults = async (teamId: number) => {
  const pendingResults = await strapiApi.request<{
    hasPendingResults: boolean;
    participatingTeamProfileIds: number[];
    participatingProfileIds: number[];
  }>("get", `/teams/get-pending-results/${teamId}`, {});

  return pendingResults;
};
