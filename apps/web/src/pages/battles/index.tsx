import { ErrorPage } from "@/components/error-page";
import {
  GamesGrid,
  GamesGridSkeleton,
} from "@/features/game/components/games-grid";
import { GradientCircle } from "@/components/gradient-circle";
import { Heading, headingVariants } from "@/components/heading";
import { useQuery } from "@tanstack/react-query";
import * as SelectPrimitive from "@radix-ui/react-select";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { textVariantClassnames } from "@/components/text";
import { Icon } from "@/components/icon";
import { SimpleSelect } from "@/components/simple-select";
import { GetGamesSort } from "@/features/game/types";
import { getGames } from "@/features/game/service/get-games";

const getSortTitle = (sort: GetGamesSort) =>
  `Sort by ${sort === "title" ? "A-Z" : "Most recent"}`;

export default function BattlesIndexPage() {
  const [sort, setSort] = useState<GetGamesSort>("date");
  const [superficiallyLoading, setSuperficiallyLoading] = useState(false);
  const { data, isLoading, isError } = useQuery(
    ["games", sort, 1],
    () => getGames(1, { sort }),
    {}
  );

  useEffect(() => {
    setSuperficiallyLoading(true);
    let timer = setTimeout(() => {
      setSuperficiallyLoading(false);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [sort]);

  if (isError) {
    return <ErrorPage type="somethingWentWrong" />;
  }

  return (
    <div>
      <GradientCircle />
      <div className="flex gap-4 mb-10">
        <Heading variant="h1" className={"mb-0"}>
          All games
        </Heading>
        <SimpleSelect
          value={sort}
          setValue={(v) => setSort(v as GetGamesSort)}
          options={["title", "date"]}
          getOptionLabel={(v) => getSortTitle(v as GetGamesSort)}
        />
      </div>
      {(isLoading || superficiallyLoading) && <GamesGridSkeleton rows={3} />}
      {!isLoading && !superficiallyLoading && data && (
        <GamesGrid games={data.data} />
      )}
    </div>
  );
}
