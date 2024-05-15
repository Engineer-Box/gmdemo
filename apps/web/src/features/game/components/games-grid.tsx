import { GameResponse } from "../types";
import { GameCard, GameCardSkeleton } from "./game-card";

type GamesGrid = {
  games: GameResponse[];
};

const gridClassNames =
  "grid grid-cols-1 gap-6 gap-y-12 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-cols-max";

export const GamesGridSkeleton = ({ rows }: { rows?: number }) => (
  <div className={gridClassNames}>
    {Array.from({ length: rows ?? 1 }).map((_, i) => (
      <div className="contents" key={i}>
        <GameCardSkeleton key={`first:${i}`} />
        <div className="hidden w-full h-full xs:block" key={`second:${i}`}>
          <GameCardSkeleton />
        </div>
        <div className="hidden w-full h-full md:block" key={`third:${i}`}>
          <GameCardSkeleton />
        </div>
        <div className="hidden w-full h-full lg:block" key={`fourth:${i}`}>
          <GameCardSkeleton />
        </div>
      </div>
    ))}
  </div>
);
export const GamesGrid = ({ games }: GamesGrid) => {
  return (
    <div className={gridClassNames}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};
