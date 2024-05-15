import { StrapiEntity, StrapiRelation } from "@/types/strapi-types";
import { Game } from "../game/types";

export type HomeOrAway = "home" | "away";

export type BattleWithoutRelations = {
  date: string;
  is_cancelled: boolean;
  pot_amount?: number;
  cancellation_requested_by?: HomeOrAway;
};

export type MatchWithoutRelations = {
  createdAt: string;
  updatedAt: string;
  result: HomeOrAway;
  home_team_vote: HomeOrAway;
  away_team_vote: HomeOrAway;
  match_meta?: {
    single: Record<string, string>;
    series: Record<string, string>[];
  };
};

export type MatchRegions = "Europe" | "North America" | "Asia" | "Oceania";

export type MatchOptionsWithoutRelations = {
  custom_attribute_inputs: (
    | {
        attribute_id: string;
        value: string;
      }
    | {
        attribute_id: string;
        value: string[];
      }
    | {
        attribute_id: "game_mode";
        value: string;
      }
  )[];
  team_size: number;
  series: number;
  region: MatchRegions;
};

export type BattleOverview = BattleWithoutRelations & {
  match_options: MatchOptionsWithoutRelations & {
    game: StrapiRelation<StrapiEntity<Pick<Game, "custom_attributes">>>;
  };
};
