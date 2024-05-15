import { strapiApi } from "@/lib/strapi";
import { HomeOrAway } from "../types";

export const reportScore = async (
  battleId: number,
  reportersSide: HomeOrAway,
  winnersSide: HomeOrAway
) => {
  await strapiApi.request("POST", `/battles/report-score/${battleId}`, {
    data: {
      data: {
        reporting_side: reportersSide,
        reported_winners_side: winnersSide,
      },
    },
  });
};
