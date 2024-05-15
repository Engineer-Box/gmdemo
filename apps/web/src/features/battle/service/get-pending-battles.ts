import { strapiApi } from "@/lib/strapi";
import { StrapiEntity, StrapiRelation } from "@/types/strapi-types";
import { BattleOverview, MatchWithoutRelations } from "../types";
import { battleOverviewPopulate } from "./shared";

type MatchWithBattleOverview = StrapiEntity<
  {
    battle: StrapiRelation<StrapiEntity<BattleOverview>, false>;
  } & MatchWithoutRelations
>;

export const getPendingBattles = async (teamId: number) => {
  const matches = await strapiApi.find<MatchWithBattleOverview>("matches", {
    sort: {
      battle: {
        date: "asc",
      },
    },
    filters: {
      home_team: {
        team: { id: { $eq: teamId } },
      },
      away_team: {
        team: {
          id: { $null: true },
        },
      },

      battle: {
        id: { $null: false },
        is_cancelled: false,
      },
    },
    populate: {
      battle: battleOverviewPopulate,
    },
  });

  const battles = matches.data.map((match) => match.attributes.battle.data);
  return {
    data: battles,
    meta: matches.meta,
  } as const;
};
