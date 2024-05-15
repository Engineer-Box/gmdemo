import { strapiApi } from "@/lib/strapi";
import { MatchRegions } from "../types";
import { getSeriesNumberFromSeriesOption } from "../util";

export type CreateBattleParams = {
  time: string;
  region: MatchRegions;
  series: "Bo1" | "Bo3" | "Bo5";
  wagerAmountPerPerson: number;
  customAttributes?: Record<string, string | string[]>;
  teamSelection: number[];
  invitedTeamId?: number;
  teamProfileId: number;
};
export const createBattle = async (params: CreateBattleParams) => {
  const id = params.teamProfileId;
  const data = {
    wager_amount_per_person: params.wagerAmountPerPerson,
    team_selection: params.teamSelection,
    invited_team_id: params.invitedTeamId,
    date: params.time,
    match_options: {
      custom_attribute_inputs: Object.entries(
        params.customAttributes ?? {}
      ).map(([attributeId, value]) => ({
        attribute_id: attributeId,
        value,
      })),
      series: getSeriesNumberFromSeriesOption(params.series),
      region: params.region,
    },
  };

  return strapiApi.request("post", `/battles/create/${id}`, {
    data: { data },
  });
};
