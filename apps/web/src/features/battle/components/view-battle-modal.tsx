import { useMemo, useState } from "react";
import { Modal } from "@/components/modal/modal";
import { BattleDetailLabelGroup } from "./battle-detail-label-group";
import { Text } from "@/components/text";
import { Button } from "@/components/button";
import { useToast } from "@/providers/toast-provider";
import {
  getCustomAttributeOptionDisplayName,
  getUnableToCreateOrJoinBattlesReason,
} from "../util";
import { useAuth } from "@/hooks/use-auth";
import { SelectSquadModalStep } from "./select-squad-modal-step";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/skeleton";
import { USER_QUERY_KEY } from "@/constants";
import { toLocalDateTime } from "@/utils/to-local-datetime";
import { getBattleDetails } from "../service/get-battle-details";
import { cancelBattle } from "../service/cancel-battle";
import { joinBattle } from "../service/join-battle";
import { declineBattleInvitation } from "../service/decline-battle-invitation";
import { useRouter } from "next/router";

export const ViewBattleModal = ({
  battleId,
  closeModal,
  isInvitation,
  onActionCompleted,
}: {
  battleId: number;
  isInvitation?: boolean;
  closeModal: () => void;
  onActionCompleted?: (action: "decline" | "confirm" | "cancel") => void;
}) => {
  const { data: battle } = useQuery(
    ["get-battle-details", battleId],
    async () => (await getBattleDetails(battleId)).data,
    {
      staleTime: 30000,
    }
  );

  const game = battle?.attributes.match_options.game.data;
  const { addToast } = useToast();
  const router = useRouter();
  const [isFirstStep, setIsFirstStep] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [teamSelection, setTeamSelection] = useState<number[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const teamProfile = useMemo(
    () => (game?.id ? getTeamProfileForUserBy("gameId", game.id, user) : null),
    [game?.id, user]
  );
  const teamId = teamProfile?.attributes.team.data?.id;

  const canCurrentUserCancel = useMemo(() => {
    if (battle && teamProfile) {
      const battleCaptainsTeamProfile =
        battle?.attributes.match.data.attributes.home_team.data?.attributes.team_selection_profiles.data?.find(
          (tsp) => tsp.attributes.is_captain
        )?.attributes.team_profile.data;
      if (battleCaptainsTeamProfile?.id === teamProfile.id) return true;
    }

    return false;
  }, [battle, teamProfile]);

  const { mutate: cancelBattleMutation, isLoading: cancelBattleIsLoading } =
    useMutation(() => cancelBattle(battleId), {
      onSuccess() {
        queryClient.invalidateQueries(USER_QUERY_KEY);
        addToast({
          type: "success",
          message: "Battle has been cancelled",
        });
      },
      onError() {
        addToast({
          type: "error",
          message: "Could not cancel battle",
        });
      },
      onSettled() {
        queryClient.invalidateQueries(["pending-battles-for-team", teamId]);
        closeModal();
      },
    });
  const { mutate: declineBattleInvitationMutation } = useMutation(
    async () => declineBattleInvitation(battleId),
    {
      onMutate() {
        addToast({
          type: "success",
          message: "Invitation has been declined",
        });
        onActionCompleted?.("decline");
      },
    }
  );

  const mutation = async () => {
    if (!teamProfile) return;

    await joinBattle({
      teamProfileId: teamProfile.id,
      battleId,
      teamSelection,
    });

    router.push(`/battle/${battleId}`);
    onActionCompleted?.("confirm");
  };

  const dateString = useMemo(
    () => (battle ? toLocalDateTime(battle.attributes.date) : ""),
    [battle?.attributes.date]
  );

  const customAttributesAndInputsStrings = useMemo(() => {
    if (!game || !battle) return [];
    const customAttributes = game.attributes.custom_attributes;
    const customAttributeInputs =
      battle.attributes.match_options.custom_attribute_inputs;

    const customAttributesToDisplay = customAttributes.filter(
      (cu: any) => cu.__component !== "custom-attributes.pick-random"
    );
    return customAttributesToDisplay.map((ca) => {
      const attributeId = ca.attribute.attribute_id;
      const attributeDisplayName = ca.attribute.display_name;
      const attributeOptionValue = customAttributeInputs.find(
        (cai) => cai.attribute_id === attributeId
      )?.value;

      const attributeOptionValues = Array.isArray(attributeOptionValue)
        ? attributeOptionValue
        : [attributeOptionValue];

      const attributeOptionDisplayValue = attributeOptionValues
        .map((v) =>
          getCustomAttributeOptionDisplayName(v!, attributeId, customAttributes)
        )
        .filter(Boolean)
        .join(", ");

      return [attributeDisplayName, attributeOptionDisplayValue] as [
        string,
        string,
      ];
    });
  }, [battle, game]);

  const wagerAmountPerPersonInCents = battle?.attributes.pot_amount
    ? battle.attributes.pot_amount /
      2 /
      battle.attributes.match_options.team_size
    : 0;
  return (
    <div className="absolute">
      <Modal
        isOpen={true}
        isClosable
        isLoading={isLoading || cancelBattleIsLoading}
        closeModal={closeModal}
        title="View Battle"
        Footer={
          <div className="flex justify-end gap-3">
            {battle && game ? (
              <>
                {isFirstStep ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (isInvitation) {
                          declineBattleInvitationMutation();
                        }
                        closeModal();
                      }}
                    >
                      {isInvitation ? "Decline" : "Cancel"}
                    </Button>
                    {canCurrentUserCancel ? (
                      <Button
                        title="Withdraw"
                        variant={"delete"}
                        onClick={cancelBattleMutation}
                      />
                    ) : (
                      <Button
                        title="Continue"
                        variant={"primary"}
                        onClick={() => {
                          const reason = getUnableToCreateOrJoinBattlesReason(
                            game.id,
                            wagerAmountPerPersonInCents,
                            user
                          );

                          if (reason) {
                            addToast({ type: "error", message: reason });
                            return;
                          }

                          setIsFirstStep(false);
                        }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {teamId && (
                      <SelectSquadModalStep.Footer
                        closeModal={closeModal}
                        setIsLoading={setIsLoading}
                        teamId={teamId}
                        onBack={() => setIsFirstStep(true)}
                        mutation={mutation}
                        teamSize={battle.attributes.match_options.team_size}
                        teamSelection={teamSelection}
                        setTeamSelection={setTeamSelection}
                        onSuccess={() => {
                          addToast({
                            type: "success",
                            message: "Battle joined successfully",
                          });
                        }}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <Skeleton dark className="w-28 h-9" />
                <Skeleton dark className="w-32 h-9" />
              </>
            )}
          </div>
        }
      >
        <>
          {battle && game ? (
            <>
              {isFirstStep ? (
                <div className="flex flex-col gap-2.5">
                  <BattleDetailLabelGroup title="Start time">
                    <Text className={"text-brand-white"}>{dateString}</Text>
                  </BattleDetailLabelGroup>

                  <BattleDetailLabelGroup title="Region">
                    <Text className={"text-brand-white"}>
                      {battle.attributes.match_options.region}
                    </Text>
                  </BattleDetailLabelGroup>
                  <BattleDetailLabelGroup title="Team size">
                    <Text className={"text-brand-white"}>
                      {battle.attributes.match_options.team_size}v
                      {battle.attributes.match_options.team_size}
                    </Text>
                  </BattleDetailLabelGroup>
                  <BattleDetailLabelGroup title="Series">
                    <Text className={"text-brand-white"}>
                      Best of {battle.attributes.match_options.series}
                    </Text>
                  </BattleDetailLabelGroup>
                  {customAttributesAndInputsStrings.map(
                    ([displayName, value]) => (
                      <BattleDetailLabelGroup key={value} title={displayName}>
                        <Text className={"text-brand-white"}>{value}</Text>
                      </BattleDetailLabelGroup>
                    )
                  )}
                  <BattleDetailLabelGroup title="Amount">
                    <Text className="text-emerald-400">
                      ${(wagerAmountPerPersonInCents / 100).toFixed(2)}
                    </Text>
                  </BattleDetailLabelGroup>
                </div>
              ) : (
                <>
                  {teamId && (
                    <SelectSquadModalStep.Content
                      teamId={teamId}
                      teamSelection={teamSelection}
                      teamSize={battle.attributes.match_options.team_size}
                      wagerAmountPerPersonInCents={wagerAmountPerPersonInCents}
                      setTeamSelection={setTeamSelection}
                      captainsTeamProfileId={teamProfile.id}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="flex gap-3">
                <Skeleton dark className="w-[30%] h-5" />
                <Skeleton dark className="w-[70%] h-5" />
              </div>
              <div className="flex gap-3">
                <Skeleton dark className="w-[30%] h-5" />
                <Skeleton dark className="w-[70%] h-5" />
              </div>
              <div className="flex gap-3">
                <Skeleton dark className="w-[30%] h-5" />
                <Skeleton dark className="w-[70%] h-5" />
              </div>
              <div className="flex gap-3">
                <Skeleton dark className="w-[30%] h-5" />
                <Skeleton dark className="w-[70%] h-5" />
              </div>
              <div className="flex gap-3">
                <Skeleton dark className="w-[30%] h-5" />
                <Skeleton dark className="w-[70%] h-5" />
              </div>
              <div className="flex gap-3">
                <Skeleton dark className="w-[30%] h-5" />
                <Skeleton dark className="w-[70%] h-5" />
              </div>
            </div>
          )}
        </>
      </Modal>
    </div>
  );
};
