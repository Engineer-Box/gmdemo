import { strapiApi } from "@/lib/strapi";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";
import {
  BattleWithoutRelations,
  HomeOrAway,
  MatchWithoutRelations,
} from "../types";
import { TeamWithoutRelations } from "@/features/team/types";
import { LeaderboardItemStats } from "./get-game-leaderboard";

type TeamSelection = StrapiRelation<
  StrapiEntity<{
    xp?: number;
    earnings?: number;
    team: StrapiRelation<
      StrapiEntity<
        TeamWithoutRelations & {
          image: StrapiRelation<StrapiEntity<StrapiImage>>;
          leaderboard_item_stats: LeaderboardItemStats;
        }
      >
    >;
  }>,
  true
>;

export type GetConfirmedBattlesForTeam = StrapiEntity<
  BattleWithoutRelations & {
    match: StrapiRelation<
      StrapiEntity<
        MatchWithoutRelations & {
          home_team: TeamSelection;
          away_team: TeamSelection;
          dispute?: StrapiRelation<
            StrapiEntity<{
              resolved_winner?: HomeOrAway;
              resolution_summary?: string;
            }>
          >;
        }
      >,
      true
    >;
  }
>;

const populate = {
  match: {
    populate: {
      dispute: true,
      home_team: {
        populate: {
          team: {
            populate: {
              leaderboard_item_stats: true,
              image: true,
            },
          },
        },
      },
      away_team: {
        populate: {
          team: {
            populate: {
              leaderboard_item_stats: true,
              image: true,
            },
          },
        },
      },
    },
  },
};

export const getConfirmedBattlesForTeam = async (
  teamId: number,
  pagination: {
    page: number;
    pageSize: number;
  }
) => {
  const battles = await strapiApi.find<GetConfirmedBattlesForTeam>("battles", {
    populate,
    sort: {
      date: "desc",
    },
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
    },
    filters: {
      match: {
        $and: [
          {
            home_team: {
              team: { id: { $notNull: true } },
            },
          },
          {
            away_team: {
              team: { id: { $notNull: true } },
            },
          },
        ],
      },
      $or: [
        {
          match: {
            home_team: {
              team: { id: { $eq: teamId } },
            },
          },
        },
        {
          match: {
            away_team: {
              team: { id: { $eq: teamId } },
            },
          },
        },
      ],

      id: { $null: false },
      is_cancelled: false,
    },
  });

  return battles;
};
