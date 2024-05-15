import {
  GameCard,
  GameCardSkeleton,
} from "@/features/game/components/game-card";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { useRouter } from "next/router";
import { GradientCircle } from "@/components/gradient-circle";
import { getGames } from "@/features/game/service/get-games";

export default function Home({}) {
  const router = useRouter();
  const { data, isLoading } = useQuery(["games", 1], () => getGames(1), {});

  return (
    <div className="lg:mt-16">
      <div className="flex flex-col gap-8">
        <Heading variant="h1" className="mb-1">
          Your esports app for web3
        </Heading>
        <div className="flex gap-8">
          <div className="pr-8 border-r-2 border-brand-navy-accent-light">
            <Heading variant="h2" className="mb-1">
              240k
            </Heading>
            <Text>Players</Text>
          </div>
          <div className="pr-8 border-r-2 border-brand-navy-accent-light">
            <Heading variant="h2" className="mb-1">
              1M
            </Heading>
            <Text>Matches played</Text>
          </div>
          <div className="pr-8">
            <Heading variant="h2" className="mb-1">
              $10M
            </Heading>
            <Text>USDC wagered</Text>
          </div>
        </div>
        <div className="flex items-center gap-3 ">
          <Heading variant="h2">Featured games</Heading>
          <Button
            className="flex-nowrap whitespace-nowrap"
            title="+ 12 more games"
            variant="secondary"
            onClick={() => router.push("/battles")}
            size="sm"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 -mt-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-cols-max">
          {isLoading && (
            <>
              <GameCardSkeleton />
              <div className="hidden w-full h-full xs:block">
                <GameCardSkeleton />
              </div>
              <div className="hidden w-full h-full md:block">
                <GameCardSkeleton />
              </div>
              <div className="hidden w-full h-full lg:block">
                <GameCardSkeleton />
              </div>
            </>
          )}
          {data?.data &&
            data.data
              .slice(0, 4)
              .map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </div>
      <GradientCircle />
    </div>
  );
}
