import { ReactNode, useEffect, useRef, useState } from "react";
import { InputLayout } from "../../../components/input-layout";
import { QueryFunction, QueryOptions, useQuery } from "@tanstack/react-query";

import { useOutsideClick } from "@/hooks/use-outside-click";
import { StrapiImage } from "@/types/strapi-types";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { Text } from "../../../components/text";
import { cn } from "@/utils/cn";
import { Skeleton } from "../../../components/skeleton";
import { GlobalSearchBarItemLayout } from "./global-search-bar-item-layout";
import { useKeyPress } from "@/hooks/use-key-press";
import { useRouter } from "next/router";
import { Image } from "@/components/image";
import { useSearchDropdown } from "@/hooks/use-search-dropdown";
import { GlobalIndexHit, globalMelilisearchIndex } from "@/lib/meilisearch";
import { SearchDropdown } from "@/components/search-dropdown/search-dropdown";

export const GlobalSearchBar = () => {
  const searchDropDown = useSearchDropdown("global-search", async (query) => {
    const searchResult = await globalMelilisearchIndex.search(query, {
      attributesToSearchOn: ["name"],
      limit: 4,
      sort: ["collection_type:desc", "name:asc"],
    });

    return searchResult.hits;
  });
  const router = useRouter();

  const onResultClick = (result: GlobalIndexHit) => {
    const baseRoute =
      result.collection_type === "games" ? "/battles" : "/profile";

    router.replace(`${baseRoute}/${result.slug}`);
    searchDropDown.setQuery("");
    searchDropDown.setIsOpen(false);
  };

  return (
    <SearchDropdown
      onResultClick={onResultClick}
      renderItem={({ name, image, collection_type }) => (
        <GlobalSearchBarItemLayout
          Left={
            <Image
              src={resolveStrapiImage(image)}
              alt={`${collection_type}:${name}`}
            />
          }
          Middle={name}
          Right={collection_type === "games" ? "Game" : "Profile"}
        />
      )}
      placeholder="Search for games, profiles, tournaments and more..."
      ItemSkeleton={
        <GlobalSearchBarItemLayout
          Left={<Skeleton className="absolute inset-0 bg-brand-navy" />}
          Middle={
            <Skeleton className="h-3 w-14 xs:w-28 md:w-56 bg-brand-navy" />
          }
          Right={<Skeleton className="w-8 h-3 xs:w-10 md:w-16 bg-brand-navy" />}
        />
      }
      NoItemsFound={
        <GlobalSearchBarItemLayout
          Left={<Image src="/pakistani-man.gif" alt="No results found" />}
          Middle="No results found"
        />
      }
      {...searchDropDown}
    />
  );
};
