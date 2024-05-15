import { StrapiResponse, strapiApi } from "@/lib/strapi";
import {
  Profile,
  ProfileWithoutRelations,
  SocialLinksComponent,
} from "../types";
import { LeaderboardItemStats } from "@/features/battle/service/get-game-leaderboard";
import { profilePopulate } from "./shared";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";

import { GameWithoutRelations } from "@/features/game/types";

export type GetProfileWithVouchAndLeaderboardItemStatsResponse = StrapiResponse<
  StrapiEntity<
    Profile & {
      vouch_count?: number;
      leaderboard_item_stats?: LeaderboardItemStats;
    }
  >
>;

export const getProfileWithVouchAndLeaderboardItemStats = async (
  id: number
) => {
  const profileResponse =
    await strapiApi.request<GetProfileWithVouchAndLeaderboardItemStatsResponse>(
      "GET",
      `/profiles/with-vouch-and-leaderboard-stats/${id}`,
      {
        params: {
          populate: profilePopulate,
        },
      }
    );

  return profileResponse;
};

getProfileWithVouchAndLeaderboardItemStats.queryKey = (id: number) => [
  "get-profile-with-vouch-and-leaderboard-item-stats",
  id,
];
