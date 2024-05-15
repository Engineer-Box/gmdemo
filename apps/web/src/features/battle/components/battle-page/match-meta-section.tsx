import { useEffect, useMemo } from "react";
import { useCountdown } from "../../hooks/use-countdown";
import { toUsdString } from "@/utils/to-usd-string";
import { cn } from "@/utils/cn";
import { toLocalDateTime } from "@/utils/to-local-datetime";
import { Loader } from "@/components/loader";
import { Skeleton } from "@/components/skeleton";
import { GetBattleResponse } from "../../service/get-battle";

const SingleMatchMetaCard = ({
  label,
  value,
  valueClassName,
}: {
  label?: string;
  value?: string;
  valueClassName?: string;
}) =>
  label && value ? (
    <div className="flex flex-col gap-0.5 font-accent bg-brand-navy-light px-3 py-1.5 rounded items-center">
      <p className="text-brand-gray text-xs">{label}</p>
      <p className={cn("text-brand-white font-lg", valueClassName)}>{value}</p>
    </div>
  ) : (
    <Skeleton className="w-36 h-14" />
  );

const SeriesMatchMetaCard = ({ items }: { items?: [string, string][] }) =>
  items ? (
    <div className="flex flex-col gap-1.5 font-accent bg-brand-navy-light px-3 py-1.5 rounded">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between">
          <p className="text-brand-gray text-sm">{label}</p>
          <p className={cn("text-brand-white font-lg")}>{value}</p>
        </div>
      ))}
    </div>
  ) : (
    <Skeleton className="w-full h-32" />
  );

export const MatchMetaSection = ({
  battle,
}: {
  battle?: GetBattleResponse;
}) => {
  const countdown = useCountdown(battle?.attributes.date);

  const singleMetaCards = useMemo(() => {
    const singleMatchMeta =
      battle?.attributes.match.data.attributes.match_meta?.single ?? {};

    return Object.entries(singleMatchMeta);
  }, [battle]);

  const seriesMetaCards = useMemo(() => {
    const seriesMatchMeta =
      battle?.attributes.match.data.attributes.match_meta?.series ?? [];

    const cards = seriesMatchMeta.map((seriesMeta) =>
      Object.entries(seriesMeta)
    );

    cards.forEach((card, i) => {
      const isHome = i % 2 === 0;
      const teamName =
        battle?.attributes.match.data.attributes[
          isHome ? "home_team" : "away_team"
        ].data?.attributes.team.data?.attributes.name;

      card.push(["Host", teamName!]);
    });

    return cards;
  }, [battle]);

  const isGameCompleted = false;

  return (
    <div className="flex flex-col gap-6 mt-9">
      <div className="flex flex-wrap gap-3 justify-center sm:justify-normal">
        <Loader
          isLoading={!battle}
          Loading={
            <>
              <SingleMatchMetaCard />
              <SingleMatchMetaCard />
              <SingleMatchMetaCard />
              <SingleMatchMetaCard />
            </>
          }
        >
          <>
            {!isGameCompleted && (
              <SingleMatchMetaCard
                label="Starts in"
                value={countdown.isExpired ? "Started" : countdown.timeLeft}
              />
            )}
            <SingleMatchMetaCard
              label="Match date"
              value={toLocalDateTime(battle?.attributes.date!)}
            />
            <SingleMatchMetaCard
              label="Pot"
              valueClassName="text-emerald-400"
              value={
                battle?.attributes.pot_amount
                  ? toUsdString(battle.attributes.pot_amount)
                  : "XP Match"
              }
            />
            {singleMetaCards.map(([label, value]) => (
              <SingleMatchMetaCard key={label} label={label} value={value} />
            ))}
          </>
        </Loader>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Loader
          isLoading={!battle}
          Loading={
            <>
              <SeriesMatchMetaCard />
              <SeriesMatchMetaCard />
              <SeriesMatchMetaCard />
            </>
          }
        >
          {seriesMetaCards.map((seriesMeta, index) => (
            <SeriesMatchMetaCard key={index} items={seriesMeta} />
          ))}
        </Loader>
      </div>
    </div>
  );
};
