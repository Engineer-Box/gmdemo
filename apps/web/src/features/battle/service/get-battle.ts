import { strapiApi } from "@/lib/strapi";
import {
  BattleWithoutRelations,
  HomeOrAway,
  MatchOptionsWithoutRelations,
  MatchWithoutRelations,
} from "../types";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";
import { GamerTagWithoutRelations } from "@/features/gamer-tag/gamer-tag-service";
import { Game, GameWithoutRelations } from "@/features/game/types";
import { ProfileWithoutRelations } from "@/features/profile/types";
import {
  Team,
  TeamProfileWithoutRelations,
  TeamWithoutRelations,
} from "@/features/team/types";
import { LeaderboardItemStats } from "./get-game-leaderboard";

type TeamSelection = StrapiRelation<
  StrapiEntity<{
    team: StrapiRelation<
      StrapiEntity<
        TeamWithoutRelations &
          Pick<Team, "image"> & {
            leaderboard_item_stats?: LeaderboardItemStats;
          }
      >
    >;
    team_selection_profiles: StrapiRelation<
      StrapiEntity<{
        is_captain: boolean;
        team_profile: StrapiRelation<
          StrapiEntity<
            TeamProfileWithoutRelations & {
              leaderboard_item_stats?: LeaderboardItemStats;
              profile: StrapiRelation<
                StrapiEntity<
                  ProfileWithoutRelations & {
                    avatar: StrapiRelation<StrapiEntity<StrapiImage>>;
                    gamer_tags: StrapiRelation<
                      StrapiEntity<
                        GamerTagWithoutRelations & {
                          game: StrapiRelation<
                            StrapiEntity<GameWithoutRelations>
                          >;
                        }
                      >[]
                    >;
                  }
                >
              >;
            }
          >
        >;
      }>[],
      false
    >;
  }>
>;
const populateTeamSelection = {
  populate: {
    team: {
      populate: {
        image: true,
        leaderboard_item_stats: true,
      },
    },
    team_selection_profiles: {
      populate: {
        team_profile: {
          populate: {
            leaderboard_item_stats: true,
            profile: {
              populate: {
                avatar: true,
                gamer_tags: {
                  populate: {
                    game: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export type GetBattleResponse = StrapiEntity<
  BattleWithoutRelations & {
    match_options: MatchOptionsWithoutRelations & {
      game: StrapiRelation<
        StrapiEntity<
          GameWithoutRelations &
            Pick<Game, "square_image" | "custom_attributes">
        >
      >;
    };
    match: StrapiRelation<
      StrapiEntity<
        MatchWithoutRelations & {
          dispute: StrapiRelation<
            StrapiEntity<{ resolved_winner?: HomeOrAway }>
          >;
          home_team: TeamSelection;
          away_team: TeamSelection;
        }
      >,
      false
    >;
  }
>;

export const getBattle = async (id: number) => {
  return await strapiApi.findOne<GetBattleResponse>("battles", id, {
    populate: {
      match_options: {
        populate: {
          game: {
            populate: {
              square_image: true,
              custom_attributes: {
                populate: {
                  attribute: true,
                  options: true,
                },
              },
            },
          },
        },
      },
      match: {
        populate: {
          dispute: true,
          home_team: populateTeamSelection,
          away_team: populateTeamSelection,
        },
      },
    },
  });
};

getBattle.queryKey = (battleId?: number) =>
  typeof battleId === "number" ? ["get-battle", battleId] : ["get-battle"];
