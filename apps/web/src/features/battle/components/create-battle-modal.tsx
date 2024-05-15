import { Button } from "@/components/button";
import { Modal } from "@/components/modal/modal";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, UseFormSetValue, useForm } from "react-hook-form";

import { useDollarInput } from "@/components/dollar-input";
import { getAvailableTimes, getTeamSizeNumberFromTeamOption } from "../util";
import { CreateBattleDetailsStep } from "./create-battle-details-modal-step";
import { cn } from "@/utils/cn";
import { useApplyLastMatch } from "../hooks/use-apply-last-match";
import { SelectSquadModalStep } from "./select-squad-modal-step";
import { useToast } from "@/providers/toast-provider";
import { CreateBattleParams, createBattle } from "../service/create-battle";
import { GameResponse } from "@/features/game/types";

export type CreateBattleInputs = Omit<
  CreateBattleParams,
  "teamProfileId" | "invitedTeamId" | "teamSelection"
> & { teamSize: `${number}v${number}` };

export const CreateBattleModal = ({
  isOpen,
  game,
  closeModal,
  user,
  teamProfile,
  invitedTeamId,
}: {
  isOpen: boolean;
  closeModal: () => void;
  user: AuthenticatedUser;
  invitedTeamId?: number;
  game: GameResponse;
  teamProfile: NonNullable<
    AuthenticatedUser["data"]["profile"]["team_profiles"]["data"]
  >[number];
}) => {
  const [isFirstStep, setIsFirstStep] = useState(true);
  const { addToast } = useToast();
  const { amountInCents, ...dollarInputProps } = useDollarInput();
  const teamId = teamProfile.attributes.team.data?.id;
  const [teamSelection, setTeamSelection] = useState<number[]>([]);
  const timeOptions = useMemo(() => getAvailableTimes(), [isOpen]);
  const teamSizeOptions = useMemo(
    () =>
      Array.from(
        { length: game.attributes.max_team_size },
        (_, i) => `${i + 1}v${i + 1}`
      ) as `${number}v${number}`[],
    [game.attributes.max_team_size]
  );
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue: setFormValue,
  } = useForm<CreateBattleInputs>({
    defaultValues: {
      teamSize: teamSizeOptions[0],
      series: "Bo1",
      time: timeOptions[0],
      region: user.data.profile.region!,
    },
  });

  const { canApplyLastMatch, applyLastMatch, saveLastMatch } =
    useApplyLastMatch(
      game,
      user,
      setFormValue,
      setTeamSelection,
      dollarInputProps.setValue
    );

  const teamSize = watch("teamSize");

  const createBattleMutation = handleSubmit(async (formValues) => {
    const timeIsInvalid = new Date(formValues.time) < new Date();

    if (timeIsInvalid) {
      throw new Error("The time you selected is in the past");
    }

    const params = {
      time: formValues.time,
      region: formValues.region,
      series: formValues.series,
      wagerAmountPerPerson: amountInCents ?? 0,
      customAttributes: formValues.customAttributes ?? {},
      teamSelection,
      teamProfileId: teamProfile.id,
      invitedTeamId,
    } as const;

    await createBattle(params);
    saveLastMatch(game.id, { ...params, teamSize: formValues.teamSize });
  });

  return (
    <Modal
      title="Create Battle"
      isOpen={isOpen}
      isLoading={isLoading}
      closeModal={closeModal}
      description={isFirstStep ? "Match Settings" : "Select Team Members"}
      isClosable
      Footer={
        <div
          className={cn("flex justify-between", !isFirstStep && "justify-end")}
        >
          {isFirstStep && (
            <Button
              variant="secondary"
              disabled={!canApplyLastMatch}
              className="bg-white/5 text-brand-white"
              title="Apply last match"
              onClick={applyLastMatch}
            />
          )}
          <div className="flex gap-3">
            {isFirstStep ? (
              <CreateBattleDetailsStep.Footer
                closeModal={closeModal}
                wagerAmountPerPerson={amountInCents}
                user={user}
                gameId={game.id}
                isFormValid={trigger}
                teamSize={teamSize}
                nextStep={() => setIsFirstStep(false)}
              />
            ) : (
              <>
                {teamId && (
                  <SelectSquadModalStep.Footer
                    closeModal={closeModal}
                    setIsLoading={setIsLoading}
                    teamId={teamId}
                    onBack={() => setIsFirstStep(true)}
                    mutation={createBattleMutation}
                    teamSize={getTeamSizeNumberFromTeamOption(teamSize)}
                    teamSelection={teamSelection}
                    setTeamSelection={setTeamSelection}
                    onSuccess={() => {
                      addToast({
                        type: "success",
                        message: "Battle created successfully",
                      });
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      }
    >
      {isFirstStep ? (
        <CreateBattleDetailsStep.Content
          control={control}
          timeOptions={timeOptions}
          teamSizeOptions={teamSizeOptions}
          teamSize={getTeamSizeNumberFromTeamOption(teamSize)}
          customAttributes={game.attributes.custom_attributes}
          {...dollarInputProps}
        />
      ) : (
        <>
          {teamId && (
            <SelectSquadModalStep.Content
              teamId={teamId}
              teamSelection={teamSelection}
              teamSize={getTeamSizeNumberFromTeamOption(teamSize)}
              wagerAmountPerPersonInCents={amountInCents}
              setTeamSelection={setTeamSelection}
              captainsTeamProfileId={teamProfile.id}
            />
          )}
        </>
      )}
    </Modal>
  );
};
