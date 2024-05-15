import { strapiApi } from "@/lib/strapi";
import {
  BattleWithoutRelations,
  MatchOptionsWithoutRelations,
  MatchWithoutRelations,
} from "../types";
import { StrapiEntity, StrapiRelation } from "@/types/strapi-types";

import { Game, GameWithoutRelations } from "@/features/game/types";
import {
  TeamProfileWithoutRelations,
  TeamWithoutRelations,
} from "@/features/team/types";

// TODO: This will return the home team from the API

type GetBattleDetailsResponse = StrapiEntity<
  BattleWithoutRelations & {
    match_options: MatchOptionsWithoutRelations & {
      game: StrapiRelation<
        StrapiEntity<GameWithoutRelations & Pick<Game, "custom_attributes">>
      >;
    };
    match: StrapiRelation<
      StrapiEntity<
        MatchWithoutRelations & {
          home_team: StrapiRelation<
            StrapiEntity<{
              team: StrapiRelation<StrapiEntity<TeamWithoutRelations>>;
              team_selection_profiles: StrapiRelation<
                StrapiEntity<{
                  is_captain: boolean;
                  team_profile: StrapiRelation<
                    StrapiEntity<TeamProfileWithoutRelations>
                  >;
                }>[],
                false
              >;
            }>
          >;
        }
      >,
      false
    >;
  }
>;

export const getBattleDetails = async (id: number) => {
  const battle = await strapiApi.findOne<GetBattleDetailsResponse>(
    "battles",
    id,
    {
      populate: {
        match_options: {
          populate: {
            game: {
              populate: {
                square_image: true,
                custom_attributes: {
                  filters: {
                    __component: { $ne: "custom-attributes.pick-random" }, // apparently strapi is unable to filter by __component
                  },
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
            home_team: {
              populate: {
                team: true,
                team_selection_profiles: {
                  populate: {
                    team_profile: true,
                  },
                },
              },
            },
          },
        },
      },
    }
  );

  return battle;
};
