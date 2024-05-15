import { GetBattleResponse } from "../../service/get-battle";
import { TeamSelectionTable } from "./team-selection-table";

export const TeamSelectionTablesSection = ({
  battle,
}: {
  battle?: GetBattleResponse;
}) => {
  const homeTeam = battle?.attributes.match.data.attributes.home_team;
  const awayTeam = battle?.attributes.match.data.attributes.away_team;
  const winningTeamId =
    battle?.attributes.match.data.attributes.result &&
    (battle?.attributes.match.data.attributes.result === "home"
      ? homeTeam?.data?.attributes.team.data?.id
      : awayTeam?.data?.attributes.team.data?.id);
  return (
    <div className="mt-5 flex flex-col w-full gap-5 md:flex-row">
      <TeamSelectionTable
        teamSelection={homeTeam}
        gameId={battle?.attributes.match_options.game.data?.id}
        winningTeamId={winningTeamId}
      />
      <TeamSelectionTable
        teamSelection={awayTeam!}
        gameId={battle?.attributes.match_options.game.data?.id}
        winningTeamId={winningTeamId}
      />
    </div>
  );
};
