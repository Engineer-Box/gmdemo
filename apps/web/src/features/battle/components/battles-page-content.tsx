import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { CreateBattleButton } from "./create-battle-button";
import * as Tabs from "@radix-ui/react-tabs";
import { Button } from "@/components/button";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { BattlesLadderTab } from "./battles-ladder-tab";
import { GameLeaderboardTab } from "./leaderboard/game-leaderboard-tab";
import { GameResponse } from "@/features/game/types";
import { BattlesPageHeader } from "./battles-page-header";
import { GetGameResponse } from "@/features/game/service/get-game";

export const BattlesPageContent = ({
  user,
  game,
}: {
  user: AuthenticatedUser;
  game: GetGameResponse;
}) => {
  const [selectedTab, setSelectedTab] = useState("ladder");
  const isMobile = !useTailwindBreakpoint("sm");

  return (
    <div>
      <BattlesPageHeader game={game} user={user} />
      <Tabs.Root
        value={selectedTab}
        onValueChange={(v) => setSelectedTab(v)}
        defaultValue="ladder"
      >
        <Tabs.List className="flex justify-between border-b-white/20 border-b pb-6 mb-6">
          <div className="flex gap-3">
            <Tabs.Trigger value="ladder">
              <Button
                title="Ladder"
                variant={"unstyled"}
                className={cn(
                  "bg-transparent border-transparent text-brand-gray hover:text-brand-white",
                  selectedTab === "ladder" &&
                    "border-brand-navy-accent-light bg-brand-navy-accent-light text-brand-white"
                )}
              />
            </Tabs.Trigger>
            <Tabs.Trigger value="leaderboard">
              <Button
                title="Leaderboard"
                variant={"unstyled"}
                className={cn(
                  "bg-transparent border-transparent text-brand-gray hover:text-brand-white",
                  selectedTab === "leaderboard" &&
                    "border-brand-navy-accent-light bg-brand-navy-accent-light text-brand-white"
                )}
              />
            </Tabs.Trigger>
          </div>

          {!isMobile && <CreateBattleButton gameOrGameId={game} />}
        </Tabs.List>
        {isMobile && (
          <CreateBattleButton gameOrGameId={game} className="w-full" />
        )}

        <Tabs.Content value="ladder">
          <BattlesLadderTab game={game} isMobile={isMobile} />
        </Tabs.Content>
        <Tabs.Content value="leaderboard">
          <GameLeaderboardTab gameId={game.id} />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};
