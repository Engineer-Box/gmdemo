import { strapiApi } from "@/lib/strapi";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";
import { StrapiError } from "@/utils/strapi-error";

// TODO: Consider moving this to the profile feature (2 services)
export type GamerTagWithoutRelations = {
  tag: string;
};

export type GamerTag = GamerTagWithoutRelations & {
  game: StrapiRelation<StrapiEntity<StrapiImage>>;
  profile: null;
};

export type GamerTagResponse = StrapiEntity<GamerTag>;

export class GamerTagService {
  static async createGamerTag(gameId: number, tag: string) {
    const gamerTagResponse = await strapiApi.create<GamerTagResponse>(
      "gamer-tags",
      {
        tag,
        game: gameId,
      }
    );

    return gamerTagResponse;
  }

  static async updateGamerTag(gamerTagId: number, tag: string) {
    const gamerTagResponse = await strapiApi.update<GamerTagResponse>(
      "gamer-tags",
      gamerTagId,
      {
        tag,
      }
    );
    return gamerTagResponse;
  }

  static async deleteGamerTag(gamerTagId: number) {
    const gamerTagResponse = await strapiApi.delete<GamerTagResponse>(
      "gamer-tags",
      gamerTagId
    );
    return gamerTagResponse;
  }
}
