import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";

import { GamerTagWithoutRelations } from "../gamer-tag/gamer-tag-service";
import { GameWithoutRelations } from "../game/types";
import {
  TeamProfileWithoutRelations,
  TeamWithoutRelations,
} from "../team/types";

export type ProfileRegions = "Europe" | "North America" | "Asia" | "Oceania";

export type ProfileWithoutRelations = {
  wallet_address: string;
  region: ProfileRegions | null;
  username: string | null;
  wager_mode: boolean;
  trust_mode: boolean;
  balance: number;
  bio: string | null;
  suspended: boolean;
};

export type SocialLinksComponent = {
  discord: string | null;
  twitter: string | null;
  youtube: string | null;
  twitch: string | null;
};

export type Profile = ProfileWithoutRelations & {
  vouched_by?: StrapiRelation<StrapiEntity<ProfileWithoutRelations>[]>;
  vouched_for?: StrapiRelation<StrapiEntity<ProfileWithoutRelations>[]>;
  avatar: StrapiRelation<StrapiEntity<StrapiImage>> | null;
  social_links: SocialLinksComponent | null;
  favourite_games: StrapiRelation<
    StrapiEntity<
      GameWithoutRelations & {
        square_image: StrapiRelation<StrapiEntity<StrapiImage>>;
      }
    >[]
  >;
  gamer_tags: StrapiRelation<
    StrapiEntity<
      GamerTagWithoutRelations & {
        game: StrapiRelation<
          StrapiEntity<
            GameWithoutRelations & {
              square_image: StrapiRelation<StrapiEntity<StrapiImage>>;
            }
          >
        >;
      }
    >[]
  >;
  team_profiles: StrapiRelation<
    StrapiEntity<
      TeamProfileWithoutRelations & {
        invited_by: StrapiRelation<StrapiEntity<ProfileWithoutRelations>>;
        team: StrapiRelation<
          StrapiEntity<
            TeamWithoutRelations & {
              image: StrapiRelation<StrapiEntity<StrapiImage>>;
              game: StrapiRelation<StrapiEntity<GameWithoutRelations>>;
            }
          >
        >;
      }
    >[]
  >;
};

export type ProfileResponse = StrapiEntity<Profile>;
