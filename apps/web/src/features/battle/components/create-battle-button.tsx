import { Button } from "@/components/button";
import { CreateBattleModal } from "./create-battle-modal";
import { CreateTeamModal } from "@/features/team/components/create-team-modal/create-team-modal";
import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/providers/toast-provider";
import { useQuery } from "@tanstack/react-query";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { getGame } from "@/features/game/service/get-game";
import { GameResponse } from "@/features/game/types";

export const CreateBattleButton = ({
  className,
  gameOrGameId,
  invitedTeamId,
}: {
  gameOrGameId: GameResponse | number;
  invitedTeamId?: number;
  className?: string;
}) => {
  const { user } = useAuth();
  const gameId =
    typeof gameOrGameId === "number" ? gameOrGameId : gameOrGameId.id;
  const {
    data: gameData,
    isError: isGameError,
    isInitialLoading: isGameLoading,
  } = useQuery(["game", gameId], async () => getGame(gameId), {
    enabled: typeof gameOrGameId === "number",
  });

  const game = typeof gameOrGameId === "number" ? gameData : gameOrGameId;
  const teamProfile = useMemo(
    () => getTeamProfileForUserBy("gameId", gameId, user),
    [gameId, user]
  );
  const [isCreateBattleModalOpen, setIsCreateBattleModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const { addToast } = useToast();
  const isUserInTeamForGame = teamProfile && !teamProfile.attributes.is_pending;
  const isUserLeaderOrFounderForGame =
    isUserInTeamForGame && teamProfile.attributes.role !== "member";

  useEffect(() => {
    if (isGameError) {
      addToast({
        type: "error",
        message: "Failed to fetch game. Please try again later.",
      });
    }
  }, [isGameError]);

  return (
    <>
      {teamProfile && user && game && isCreateBattleModalOpen && (
        <CreateBattleModal
          teamProfile={teamProfile}
          user={user}
          invitedTeamId={invitedTeamId}
          isOpen={isCreateBattleModalOpen}
          game={game}
          closeModal={() => setIsCreateBattleModalOpen(false)}
        />
      )}
      {user && (
        <CreateTeamModal
          user={user}
          setIsOpen={setIsCreateTeamModalOpen}
          onTeamCreated={() => {
            setIsCreateBattleModalOpen(true);
          }}
          onTeamCreateError={() => {
            addToast({
              type: "error",
              message: "Failed to create team. Please try again later.",
            });
          }}
          isOpen={isCreateTeamModalOpen}
          fixedGameId={gameId}
        />
      )}
      <Button
        className={className}
        disabled={!game || isGameLoading}
        icon={invitedTeamId ? "battles" : undefined}
        title={
          !!invitedTeamId
            ? "Challenge team"
            : isUserInTeamForGame
              ? "Create a battle"
              : "Create a team"
        }
        variant={
          !!invitedTeamId || isUserInTeamForGame ? "primary" : "secondary"
        }
        onClick={() => {
          if (!isUserInTeamForGame) {
            setIsCreateTeamModalOpen(true);
          } else {
            if (!isUserLeaderOrFounderForGame) {
              addToast({
                type: "warning",
                message: "Only team leaders or founders can create battles.",
              });
              return;
            }
            setIsCreateBattleModalOpen(true);
          }
        }}
      />
    </>
  );
};
