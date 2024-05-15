import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";

export type GameWithoutRelations = {
  title: string;
  slug: string;
  max_team_size: number;
  rules_url?: string;
};

export type SelectCustomAttribute = {
  id: number;
  input_type: "dropdown" | "radio" | "multi-select";
  __component: "custom-attributes.select";
  attribute: {
    attribute_id: string;
    display_name: string;
  };
  options: { option_id: string; display_name: string }[];
};

export type Game = GameWithoutRelations & {
  card_image: StrapiRelation<StrapiEntity<StrapiImage>>;
  cover_image: StrapiRelation<StrapiEntity<StrapiImage>>;
  square_image: StrapiRelation<StrapiEntity<StrapiImage>>;
  custom_attributes: SelectCustomAttribute[];
};

export type GameResponse = StrapiEntity<Game>;

export type GetGamesSort = "date" | "title";
