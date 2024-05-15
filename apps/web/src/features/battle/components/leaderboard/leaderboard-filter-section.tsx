import {
  GameLeaderboardPeriods,
  GameLeaderboardType,
} from "../../service/get-game-leaderboard";
import { useState } from "react";
import { Select } from "@/components/select";
import { InputLayout } from "@/components/input-layout";
import { Button } from "@/components/button";

type LeaderboardFilterSectionProps = {
  leaderboardType: GameLeaderboardType;
  setLeaderboardType: (type: GameLeaderboardType) => void;
  period?: GameLeaderboardPeriods;
  setPeriod: (period?: GameLeaderboardPeriods) => void;
  query: string;
  setQuery: (query: string) => void;
};

export const useLeaderboardFilters = (): LeaderboardFilterSectionProps => {
  const [leaderboardType, setLeaderboardType] =
    useState<GameLeaderboardType>("game-profile");
  const [period, setPeriod] = useState<GameLeaderboardPeriods>();
  const [query, setQuery] = useState("");

  return {
    leaderboardType,
    setLeaderboardType,
    period,
    setPeriod,
    query,
    setQuery,
  };
};

export const LeaderboardFilterSection = ({
  period,
  setPeriod,
  query,
  setQuery,
  leaderboardType,
  setLeaderboardType,
}: LeaderboardFilterSectionProps) => {
  const [inputValue, setInputValue] = useState("");

  const periodId = period
    ? period === "year"
      ? "yearly"
      : "monthly"
    : "all-time";

  return (
    <div className="flex w-full flex-col-reverse md:flex-row gap-2 md:gap-4 lg:gap-5">
      <div className="relative w-full md:w-auto">
        <InputLayout icon="search" className="h-11 md:h-full">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full h-full bg-transparent outline-none focus:outline-none text-brand-white pr-16"
          />
        </InputLayout>
        <Button
          onClick={() => setQuery(inputValue)}
          className="absolute right-0 mr-3 top-1/2 -translate-y-1/2 text-brand-white text-sm py-[2px] px-2"
          variant={"secondary"}
          disabled={inputValue.length > 0 && inputValue.length < 3}
          size={"sm"}
          title="Apply"
        />
      </div>
      <div className="w-full md:w-auto">
        <Select
          autoHeight
          options={["game-profile", "game-team"]}
          icon={leaderboardType === "game-profile" ? "profile" : "globe"}
          value={leaderboardType}
          setValue={setLeaderboardType as any}
          getLabel={(value) => (value === "game-profile" ? "Profile" : "Team")}
        />
      </div>
      <div className="w-full md:w-auto">
        <Select
          autoHeight
          options={["monthly", "yearly", "all-time"]}
          icon={"clock"}
          value={periodId}
          setValue={(v) => {
            if (v === "all-time") {
              setPeriod(undefined);
            }
            if (v === "yearly") {
              setPeriod("year");
            }
            if (v === "monthly") {
              setPeriod("month");
            }
          }}
          getLabel={(value) =>
            value === "all-time"
              ? "All time"
              : value === "yearly"
                ? "This year"
                : "This month"
          }
        />
      </div>
    </div>
  );
};
