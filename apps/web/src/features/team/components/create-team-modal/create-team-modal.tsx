import { Modal } from "@/components/modal/modal";
import { useStrapiImageUpload } from "@/hooks/use-strapi-image-upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { useRouter } from "next/router";
import { useToast } from "@/providers/toast-provider";
import { CreateTeamModalStep } from "./create-team-modal-step";
import { TeamMemberUpdate } from "../../types";
import { InviteTeamModalStep } from "./invite-team-modal-step";
import { validateTeamName } from "../../util";
import { MAX_TEAM_MEMBERS } from "../../constants";
import { useGameSelect } from "@/features/game/components/game-select";
import { USER_QUERY_KEY } from "@/constants";
import { CreateGamerTagModal } from "@/features/gamer-tag/components/create-gamer-tag-modal";
import { createTeam } from "../../service/create-team";
import { bulkUpdateTeamMembers } from "../../service/bulk-update-team-members";

export type CreateTeamModalProps = {
  user: AuthenticatedUser;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fixedGameId?: number;
  onTeamCreated?: (teamId: number) => void;
  onTeamCreateError?: () => void;
};

export const CreateTeamModal = ({
  isOpen,
  setIsOpen,
  fixedGameId,
  user,
  onTeamCreated,
  onTeamCreateError,
}: CreateTeamModalProps) => {
  const [isFirstStep, setIsFirstStep] = useState(true);
  const { addToast } = useToast();
  const [isCreateGamerTagModalOpen, setIsCreateGamerTagModalOpen] =
    useState(false);
  const { selectedGame, setSelectedGame, gameSelectError, setGameSelectError } =
    useGameSelect();
  const router = useRouter();

  const [teamMemberInvites, setTeamMemberInvites] = useState<
    TeamMemberUpdate[]
  >([]);

  useEffect(() => {
    if (!isOpen) return;
    const initialTeamMember: TeamMemberUpdate = {
      image: user.data.profile.avatar?.data?.attributes ?? null,
      username: user.data.profile.username!,
      userId: user.data.profile.id,
      isPending: false,
      role: "founder",
    };

    setTeamMemberInvites((p) => [
      ...p.filter((tmi) => tmi.userId !== user.data.profile.id),
      initialTeamMember,
    ]);
  }, [user, isOpen]);

  const queryClient = useQueryClient();
  const {
    handleSubmit,
    formState,
    register,
    reset: resetFormState,
    getValues,
    setError,
  } = useForm<{ teamName: string }>();

  const {
    imageUploadState,
    fileObjectUrl,
    onFileInputChange,
    resetFileState,
    resetUploadState,
  } = useStrapiImageUpload();

  useEffect(() => {
    if (selectedGame) {
      setGameSelectError(false);
    }
  }, [selectedGame]);

  const gameIdsProfileIsOnTeamFor = useMemo(
    () =>
      (user.data.profile.team_profiles.data
        ?.map((tp) => tp.attributes.team.data?.attributes.game.data?.id ?? null)
        .filter(Boolean) as number[]) || [],
    [user.data.profile.team_profiles.data]
  );

  const onTeamDetailsSubmit = handleSubmit(({ teamName }) => {
    const teamNameError = validateTeamName(teamName);
    if (teamNameError) {
      setError("teamName", {
        type: "custom",
        message: teamNameError,
      });
      return;
    }
    if (!selectedGame) {
      setGameSelectError("Please select a game");
      return;
    }
    setIsFirstStep(false);
  });

  const {
    mutate: createTeamMutation,
    isLoading: createTeamMutationIsLoading,
    isError: createTeamMutationIsError,
  } = useMutation(
    async () => {
      // create the team
      const teamName = getValues("teamName");
      const imageId =
        imageUploadState.status === "complete"
          ? imageUploadState.detail
          : undefined;

      const newlyCreatedTeam = await createTeam({
        name: teamName,
        gameId: selectedGame?.id!,
        image: imageId,
      });

      await bulkUpdateTeamMembers(
        newlyCreatedTeam.data.id,
        teamMemberInvites.map((tmi) => ({
          profile: tmi.userId,
          role: tmi.role,
        }))
      );

      return newlyCreatedTeam.data.id;
    },
    {
      onSuccess(data) {
        queryClient.invalidateQueries(USER_QUERY_KEY);

        if (onTeamCreated) {
          onTeamCreated(data);
        } else {
          addToast({ type: "success", message: "Team created!" });
          router.push(`/team/${data}`);
        }
      },
      onSettled() {
        closeModal();
      },
    }
  );

  const onInviteTeamSubmit = () => {
    const hasGamerTagForGame = user.data.profile.gamer_tags.data?.some(
      (gt) => gt.attributes.game.data?.id === selectedGame?.id
    );

    if (hasGamerTagForGame) {
      createTeamMutation();
    } else {
      setIsCreateGamerTagModalOpen(true);
    }
  };

  const resetState = () => {
    setIsOpen(false);
    setSelectedGame(null);
    setGameSelectError(false);
    setIsFirstStep(true);
    resetFileState();
    resetUploadState();
    resetFormState();
    setTeamMemberInvites([]);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetState();
  };

  useEffect(() => {
    if (createTeamMutationIsError) {
      if (onTeamCreateError) {
        onTeamCreateError();
      } else {
        router.push("/500");
      }
      closeModal();
    }
  }, [createTeamMutationIsError]);

  return (
    <>
      <CreateGamerTagModal
        isOpen={isCreateGamerTagModalOpen}
        fixedGameId={selectedGame?.id}
        closeModal={() => setIsCreateGamerTagModalOpen(false)}
        onSuccess={() => {
          setIsCreateGamerTagModalOpen(false);
          createTeamMutation();
        }}
      />
      <Modal
        title={isFirstStep ? "Create team" : "Invite team"}
        isOpen={isOpen}
        isClosable
        closeModal={() => closeModal()}
        isLoading={createTeamMutationIsLoading}
        size={"md"}
        description={
          isFirstStep
            ? "Team details"
            : `Invite team (up to ${
                MAX_TEAM_MEMBERS - teamMemberInvites.length
              } more players)`
        }
        Footer={
          <div className="flex justify-end w-full gap-2">
            {isFirstStep ? (
              <CreateTeamModalStep.Footer
                onSubmit={onTeamDetailsSubmit}
                closeModal={closeModal}
                imageUploadState={imageUploadState}
              />
            ) : (
              <InviteTeamModalStep.Footer
                onSubmit={onInviteTeamSubmit}
                setIsFirstStep={setIsFirstStep}
              />
            )}
          </div>
        }
      >
        <div className="relative z-0">
          {isFirstStep && (
            <CreateTeamModalStep.Content
              imageUploadState={imageUploadState}
              fileObjectUrl={fileObjectUrl}
              onFileInputChange={onFileInputChange}
              handleSubmit={handleSubmit}
              register={register}
              formState={formState}
              fixedGameId={fixedGameId}
              getValues={getValues}
              gameSelectError={gameSelectError}
              setSelectedGame={setSelectedGame}
              gameIdsToExclude={gameIdsProfileIsOnTeamFor}
              reset={resetFormState}
              setError={setError}
              selectedGame={selectedGame}
            />
          )}
          {!isFirstStep && (
            <InviteTeamModalStep.Content
              teamMemberInvites={teamMemberInvites}
              setTeamMemberInvites={setTeamMemberInvites}
            />
          )}
        </div>
      </Modal>
    </>
  );
};
