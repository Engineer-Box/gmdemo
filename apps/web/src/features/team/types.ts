import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";
import { Profile, ProfileWithoutRelations } from "../profile/types";
import { GamerTagWithoutRelations } from "../gamer-tag/gamer-tag-service";
import { Game, GameWithoutRelations } from "../game/types";
import { LeaderboardItemStats } from "../battle/service/get-game-leaderboard";

export type TeamRoles = "founder" | "leader" | "member";

export type TeamMemberUpdate = {
  image: StrapiImage | null;
  username: string;
  userId: number;
  role: TeamRoles;
  isPending: boolean;
};

export type TeamProfileWithoutRelations = {
  is_pending: boolean;
  role: TeamRoles;
  xp: number;
  earnings: number;
  rank: number;
  deleted?: boolean;
};

export type TeamProfile = TeamProfileWithoutRelations & {
  profile: StrapiRelation<
    StrapiEntity<ProfileWithoutRelations & Pick<Profile, "avatar">>
  >;
  invited_by: StrapiRelation<StrapiEntity<ProfileWithoutRelations>>;
  gamer_tag: StrapiRelation<StrapiEntity<GamerTagWithoutRelations>>;
  avatar: StrapiRelation<StrapiEntity<StrapiImage>>;
};

export type TeamWithoutRelations = {
  name: string;

  deleted?: boolean;
};

export type Team = TeamWithoutRelations & {
  image: StrapiRelation<StrapiEntity<StrapiImage>>;
  leaderboard_item_stats: LeaderboardItemStats;
  game: StrapiRelation<
    StrapiEntity<
      GameWithoutRelations &
        Pick<
          Game,
          "card_image" | "cover_image" | "square_image" | "custom_attributes"
        >
    >
  >;
  team_profiles: StrapiRelation<
    StrapiEntity<
      TeamProfile & {
        leaderboard_item_stats?: LeaderboardItemStats;
      }
    >[]
  >;
};

export type TeamResponse = StrapiEntity<Team>;

export const teamPopulate = {
  leaderboard_item_stats: true,
  team_profiles: {
    populate: {
      leaderboard_item_stats: true,
      gamer_tag: true,
      profile: {
        populate: {
          avatar: true,
        },
      },
    },
  },
  game: {
    populate: {
      cover_image: true,
      card_image: true,
      square_image: true,
      custom_attributes: {
        populate: {
          attribute: true,
          options: true,
        },
      },
    },
  },
  image: true,
};
