import { StrapiImage } from "@/types/strapi-types";
import MeiliSearch from "meilisearch";

export type GlobalIndexHit = {
  name: string;
  collection_type: "profiles" | "games";
  image: StrapiImage;
  id: number;
  slug: string | number;
};

const meilisearchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_URL!,
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_PUBLIC_API_KEY!,
});

export const globalMelilisearchIndex =
  meilisearchClient.index<GlobalIndexHit>("global");
