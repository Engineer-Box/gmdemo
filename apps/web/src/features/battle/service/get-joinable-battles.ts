import { strapiApi } from "@/lib/strapi";
import { StrapiEntity, StrapiRelation } from "@/types/strapi-types";
import { BattleOverview, MatchWithoutRelations } from "../types";

type MatchWithBattleOverview = StrapiEntity<
  {
    battle: StrapiRelation<StrapiEntity<BattleOverview>, false>;
  } & MatchWithoutRelations
>;

export const getJoinableBattles = async ({
  gameId,
  teamId,
  pageNumber,
  pageSize,
}: {
  gameId: number;
  teamId?: number;
  pageNumber: number;
  pageSize: number;
}) => {
  const matches = await strapiApi.find<MatchWithBattleOverview>("matches", {
    pagination: {
      page: pageNumber,
      pageSize,
    },
    populate: {
      battle: {
        populate: {
          match_options: true,
        },
      },
    },
    sort: {
      battle: {
        date: "asc",
      },
    },
    filters: {
      home_team: {
        team: { id: { $ne: teamId } },
      },
      away_team: {
        team: {
          id: { $null: true },
        },
      },

      battle: {
        id: { $null: false },
        invited_team: { id: { $null: true } },
        is_cancelled: false,
        date: { $gt: new Date().toISOString() },
        match_options: {
          game: gameId,
        },
      },
    },
  });

  const battles = matches.data.map((match) => match.attributes.battle.data);

  return { data: battles, meta: matches.meta } as const;
};
