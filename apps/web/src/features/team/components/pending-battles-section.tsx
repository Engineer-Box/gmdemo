import { useQuery } from "@tanstack/react-query";
import { Heading } from "@/components/heading";
import { BattleLadderCard } from "@/features/battle/components/battle-ladder-card";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { getPendingBattles } from "@/features/battle/service/get-pending-battles";
import { getTeam } from "../service/get-team";

type PendingBattlesSectionProps = {
  teamId: number;
};

export const PendingBattlesSection = ({
  teamId,
}: PendingBattlesSectionProps) => {
  const { data: team } = useQuery(["team", teamId], () => getTeam(teamId));
  const {
    data: pendingBattles,
    isLoading,
    isError,
  } = useQuery(["pending-battles-for-team", teamId], () =>
    getPendingBattles(teamId)
  );
  const isMobile = !useTailwindBreakpoint("sm");

  if (isLoading) return null;
  if (!isLoading && !pendingBattles?.data.length) return null;

  return (
    <div>
      <Heading variant="h5" className={"mb-4 mt-4"}>
        Pending Matches
      </Heading>

      <div className="flex flex-col gap-3">
        <>{isLoading && <BattleLadderCard />}</>
        <>
          {pendingBattles?.data.map((battle) => (
            <BattleLadderCard
              key={battle.id}
              isMobile={isMobile}
              battleOverview={battle}
              gameAttributes={
                team?.data.attributes.game.data?.attributes.custom_attributes ??
                []
              }
              gameImage={
                team?.data.attributes.game.data?.attributes.square_image.data
                  ?.attributes
              }
            />
          ))}
        </>
      </div>
    </div>
  );
};
