import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useStrapiImageUpload } from "@/hooks/use-strapi-image-upload";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Heading, headingVariants } from "@/components/heading";
import { EditableImagePageSection } from "@/components/editable-image-page-section";
import { cn } from "@/utils/cn";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { useToast } from "@/providers/toast-provider";
import { validateTeamName } from "../util";
import { StrapiError } from "@/utils/strapi-error";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TeamMembersTable } from "./team-members-table";
import { TeamActionButtons } from "./team-action-buttons";
import { TeamInviteReceivedModal } from "./team-invite-recieved-modal";
import { Text } from "@/components/text";
import { USER_QUERY_KEY } from "@/constants";
import { CreateBattleButton } from "@/features/battle/components/create-battle-button";
import { PendingBattlesSection } from "./pending-battles-section";
import { RecentMatchesTable } from "./recent-matches-table";
import { updateTeam } from "../service/update-team";
import { TeamResponse } from "../types";
import { Badge } from "@/components/badge";
import { LeaderboardItemStatsUtils } from "@/features/battle/util";

export type TeamPageContent = {
  team: TeamResponse;
  teamProfile:
    | NonNullable<
        AuthenticatedUser["data"]["profile"]["team_profiles"]["data"]
      >[0]
    | null;
};
export const TeamPageContent = ({ team, teamProfile }: TeamPageContent) => {
  const editableImageProps = useStrapiImageUpload();
  const [isEditMode, setIsEditMode] = useState(false);
  const role = teamProfile?.attributes.role;
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [teamNameInputValue, setTeamNameInputValue] = useState(
    team.attributes.name
  );

  const isInvitationPending = teamProfile?.attributes.is_pending;
  const [isTeamInviteReceivedModalOpen, setIsTeamInviteReceivedModalOpen] =
    useState(!!isInvitationPending);

  const { mutate: updateTeamMutation, isError: updateTeamErrorIsError } =
    useOptimisticMutation<
      Awaited<ReturnType<typeof updateTeam>>,
      (data: Parameters<typeof updateTeam>[1]) => ReturnType<typeof updateTeam>
    >(
      async (data) => {
        const teamNameErrorMessage = data.name && validateTeamName(data.name);

        if (teamNameErrorMessage) {
          throw new Error(teamNameErrorMessage);
        }
        return updateTeam(team.id, data);
      },
      {
        queryKey: ["team", team.id],
        updateCache(variables, previousValueDraft) {
          if (previousValueDraft) {
            previousValueDraft.data.attributes.name =
              variables.name ?? previousValueDraft.data.attributes.name;

            if (variables.image) {
              // TODO: Find the URL of the upload  and set that as the URL. Might not be necessary actually as we look at the object URL anyway
            }
          }

          return previousValueDraft;
        },
        onError(error: any) {
          const errorMessage = StrapiError.isStrapiError(error)
            ? error.error.message
            : "message" in error && error?.message?.length
              ? error.message
              : "Something went wrong";

          addToast({
            type: "error",
            message: errorMessage,
          });
        },
        onSuccess() {
          addToast({
            type: "success",
            message: "Team updated",
          });

          queryClient.invalidateQueries(USER_QUERY_KEY);
        },
      }
    );

  useEffect(() => {
    if (isEditMode) {
      inputRef.current?.focus();
    }
  }, [isEditMode]);

  // Keep the input value in sync with the team name
  useEffect(() => {
    if (!isEditMode || updateTeamErrorIsError) {
      setTeamNameInputValue(team.attributes.name);
    }
  }, [team.attributes.name, updateTeamErrorIsError]);

  const onSave = () => {
    const { detail, status } = editableImageProps.imageUploadState;
    const image = status === "complete" ? detail : undefined;

    updateTeamMutation({ name: teamNameInputValue, image });
  };

  return (
    <div>
      <TeamInviteReceivedModal
        isOpen={isTeamInviteReceivedModalOpen}
        closeModal={() => setIsTeamInviteReceivedModalOpen(false)}
        teamProfile={teamProfile}
      />
      <EditableImagePageSection
        isEditMode={isEditMode}
        onSave={onSave}
        initialImage={team.attributes.image}
        TitleSection={
          isEditMode ? (
            <input
              ref={inputRef}
              type="text"
              value={teamNameInputValue}
              onChange={(e) => setTeamNameInputValue(e.target.value)}
              className={cn(headingVariants({ variant: "h1" }), [
                "bg-transparent",
                "mb-0",
                "border",
                "border-solid",
                "text-brand-white",
                "rounded",
                "cursor-text",
                "outline-none",
                "focus:outline-none",
                "border-brand-navy-accent-light",
                "focus:border-brand-gray",
                "px-2",
                "w-56",
              ])}
            />
          ) : (
            <Heading
              variant="h1"
              className={
                "mb-0 outline-none cursor-default focus:outline-none overflow-hidden"
              }
            >
              {team.attributes.name}
            </Heading>
          )
        }
        ContentSection={
          <div>
            <div className="flex flex-row-reverse gap-2 md:flex-row md:gap-4 items-center justify-end md:justify-start">
              <Text className={"text-xl"}>
                {team.attributes.game.data?.attributes.title}
              </Text>
              <div>
                <Badge colorScheme={"violet"}>
                  {LeaderboardItemStatsUtils.getRankText(
                    team.attributes.leaderboard_item_stats
                  )}
                </Badge>
              </div>
            </div>
            {!teamProfile && (
              <div className="mt-2">
                <CreateBattleButton
                  invitedTeamId={team.id}
                  gameOrGameId={team.attributes.game.data?.id!}
                />
              </div>
            )}
          </div>
        }
        {...editableImageProps}
        setIsEditMode={setIsEditMode}
        showEditButton={role === "founder"}
      />

      <div className={cn("mt-4 md:mt-0")} />
      <TeamActionButtons team={team} teamProfile={teamProfile} />
      {(role === "founder" || role === "leader") && (
        <PendingBattlesSection teamId={team.id} />
      )}
      <div className={"mt-4 md:mt-8 flex flex-col gap-4 md:gap-8"}>
        <TeamMembersTable team={team} />
        <RecentMatchesTable teamId={team.id} />
      </div>
    </div>
  );
};
