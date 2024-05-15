import { HomeOrAway } from "../../types";
import { GetBattleResponse } from "../../service/get-battle";
import { useState } from "react";
import { Button } from "@/components/button";
import { useCountdown } from "../../hooks/use-countdown";
import { ReportScoreModal } from "./report-score-modal";
import { ViewDisputeModal } from "./view-dispute-modal";

export const ReportScoreButton = ({
  battle,
  side,
}: {
  battle: GetBattleResponse;
  side: HomeOrAway;
}) => {
  const countdown = useCountdown(battle.attributes.date);
  const [isReportScoreModalOpen, setIsReportScoreModalOpen] = useState(false);
  const [isViewDisputeModalOpen, setIsViewDisputeModalOpen] = useState(false);
  const didMatchStart = countdown.isExpired;
  const didHomeTeamCastVote =
    !!battle?.attributes.match.data.attributes.home_team_vote;
  const didAwayTeamCastVote =
    !!battle?.attributes.match.data.attributes.away_team_vote;
  const hasCastVote =
    side === "home" ? didHomeTeamCastVote : didAwayTeamCastVote;
  const isDisputed =
    battle?.attributes.match.data.attributes.dispute.data?.id &&
    !battle.attributes.match.data.attributes.dispute.data.attributes
      .resolved_winner;

  return (
    <div className="relative">
      <ViewDisputeModal
        matchId={battle.id}
        isOpen={isViewDisputeModalOpen}
        closeModal={() => setIsViewDisputeModalOpen(false)}
      />
      <ReportScoreModal
        isOpen={isReportScoreModalOpen}
        match={battle?.attributes.match}
        battleId={battle.id}
        reportersSide={side}
        closeModal={() => setIsReportScoreModalOpen(false)}
      />
      <Button
        onClick={() => {
          if (isDisputed) {
            setIsViewDisputeModalOpen(true);
          } else {
            setIsReportScoreModalOpen(true);
          }
        }}
        disabled={!didMatchStart || (!isDisputed && hasCastVote)}
        variant={isDisputed ? "warning" : "primary"}
        className="w-full"
        title={
          isDisputed
            ? "Disputed"
            : hasCastVote
              ? "Waiting for opponent"
              : "Report score"
        }
      />
    </div>
  );
};
