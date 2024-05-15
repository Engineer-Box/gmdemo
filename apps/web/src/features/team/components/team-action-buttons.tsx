import { AuthenticatedUser } from "@/hooks/use-auth";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/providers/toast-provider";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button";
import { TeamMemberUpdate, TeamResponse } from "../types";
import { TeamMemberEdit } from "./team-member-edit";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { StrapiError } from "@/utils/strapi-error";
import { createFakeTeamProfile } from "../util";
import { USER_QUERY_KEY } from "@/constants";
import { getTeam } from "../service/get-team";
import { bulkUpdateTeamMembers } from "../service/bulk-update-team-members";
import { leaveTeam } from "../service/leave-team";
import { deleteTeam } from "../service/delete-team";

// TODO: Might move all logic regarding whether team is deletable or player can leave to the backend and return errors

type TeamActionButtonsProps = {
  team: TeamResponse;
  teamProfile:
    | NonNullable<
        AuthenticatedUser["data"]["profile"]["team_profiles"]["data"]
      >[0]
    | null;
};

const isPendingResultsError = (e: any) =>
  StrapiError.isStrapiError(e) && e.error.message === "PendingResults";

export const TeamActionButtons = ({
  team,
  teamProfile,
}: TeamActionButtonsProps) => {
  const isPlayerPendingGames = Math.floor(Math.random() * 1000) % 2 === 0;
  const [isDestructiveModalOpen, setIsDestructiveModalOpen] = useState(false);
  const [isTeamUpdateModalOpen, setIsTeamUpdateModalOpen] = useState(false);
  const role = teamProfile?.attributes.role;
  const { addToast } = useToast();
  const isPending = teamProfile?.attributes.is_pending ?? false;
  const router = useRouter();
  const queryClient = useQueryClient();

  // TODO: This might be overkill, might be better to just use the loading state
  const { mutate: updateTeamMutation } = useOptimisticMutation<
    Awaited<ReturnType<typeof getTeam>>,
    (data: TeamMemberUpdate[]) => ReturnType<typeof bulkUpdateTeamMembers>
  >(
    async (data) => {
      return bulkUpdateTeamMembers(
        team.id,
        data.map((d) => ({ profile: d.userId, role: d.role }))
      );
    },
    {
      queryKey: ["team", team.id],
      updateCache(variables, previousValueDraft) {
        if (previousValueDraft) {
          // Determine whether the member was added, updated or removed and update the cache accordingly
          (previousValueDraft.data.attributes.team_profiles.data ?? []).forEach(
            (teamProfileInCache) => {
              const teamProfileUpdate = variables.find(
                (d) =>
                  d.userId === teamProfileInCache.attributes.profile.data?.id
              );

              if (teamProfileUpdate) {
                // Update the role
                teamProfileInCache.attributes.role = teamProfileUpdate.role;
              } else {
                // Remove the team profile
                previousValueDraft.data.attributes.team_profiles.data =
                  previousValueDraft.data.attributes.team_profiles.data?.filter(
                    (d) =>
                      d.attributes.profile.data?.id !==
                      teamProfileInCache.attributes.profile.data?.id
                  ) ?? null;
              }
            }
          );

          variables.forEach((teamProfileUpdate) => {
            const isNew =
              !previousValueDraft.data.attributes.team_profiles.data?.some(
                (tp) =>
                  tp.attributes.profile.data?.id === teamProfileUpdate.userId
              );

            // Create
            if (isNew) {
              previousValueDraft.data.attributes.team_profiles.data?.push(
                createFakeTeamProfile(teamProfileUpdate)
              );
            }
          });
        }

        return previousValueDraft;
      },
      onError(error) {
        addToast({
          type: "error",
          message: StrapiError.isStrapiError(error)
            ? error.error.message === "PendingResults"
              ? "Cannot remove or demote a team member with upcoming games"
              : error.error.message
            : "Something went wrong",
        });
      },
      onSuccess() {
        addToast({
          type: "success",
          message: "Team updated successfully",
        });
      },
    }
  );

  const [teamSelection, setTeamSelection] = useState<TeamMemberUpdate[]>([]);

  const { mutate: leaveTeamMutation, isLoading: isLeaveTeamMutationLoading } =
    useMutation((id: number) => leaveTeam(id), {
      onSuccess() {
        queryClient.invalidateQueries(USER_QUERY_KEY);
        addToast({ type: "success", message: "You have left the team" });
        router.replace("/");
      },
      onError(e) {
        const errorMessage = isPendingResultsError(e)
          ? "You have upcoming games with this team"
          : "Something went wrong";

        addToast({ type: "error", message: errorMessage });
      },
      onSettled() {
        setIsDestructiveModalOpen(false);
      },
    });

  const { mutate: deleteTeamMutation, isLoading: deleteTeamMutationIsLoading } =
    useMutation(({ id }: { id: number }) => deleteTeam(id), {
      onSuccess() {
        queryClient.invalidateQueries(USER_QUERY_KEY);
        addToast({ type: "success", message: "Team deleted" });
        router.replace("/");
      },
      onError(e) {
        const errorMessage = isPendingResultsError(e)
          ? "You cannot delete a team with upcoming games"
          : "Something went wrong";
        addToast({ type: "error", message: errorMessage });
      },
      onSettled() {
        setIsDestructiveModalOpen(false);
      },
    });

  useEffect(() => {
    const teamProfiles = team.attributes.team_profiles.data ?? [];
    // Ensure team member selection stays in sync with the team profiles
    // And re-sync when the modal closes
    setTeamSelection(
      teamProfiles.map((tp) => ({
        image:
          tp.attributes.profile.data?.attributes.avatar?.data?.attributes ??
          null,
        username: tp.attributes.profile.data?.attributes.username!,
        userId: tp.attributes.profile.data?.id!,
        role: tp.attributes.role,
        isPending: tp.attributes.is_pending,
      }))
    );
  }, [team.attributes.team_profiles.data, isTeamUpdateModalOpen]);

  if (!role) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isTeamUpdateModalOpen}
        closeModal={() => setIsTeamUpdateModalOpen(false)}
        title={role === "founder" ? "Edit team" : "Invite players"}
        isClosable
        Footer={
          <div className="flex justify-end w-full gap-4">
            <Button
              variant="secondary"
              title="Cancel"
              onClick={() => setIsTeamUpdateModalOpen(false)}
            />
            <Button
              variant="primary"
              title={role === "founder" ? "Save" : "Invite"}
              disabled={false}
              onClick={() => {
                updateTeamMutation(teamSelection);
                setIsTeamUpdateModalOpen(false);
              }}
            />
          </div>
        }
      >
        <TeamMemberEdit
          teamMemberInvites={teamSelection}
          setTeamMemberInvites={setTeamSelection}
          allowOwnershipTransfer
          teamId={team.id}
        />
      </Modal>
      <Modal
        isOpen={isDestructiveModalOpen}
        closeModal={() => setIsDestructiveModalOpen(false)}
        title="Are you sure?"
        description={
          role === "founder"
            ? "This action cannot be undone, and all team members will be removed from the team."
            : "Once you leave, your game history will be removed from the team."
        }
        isClosable
        isLoading={deleteTeamMutationIsLoading || isLeaveTeamMutationLoading}
        Footer={
          <div className="flex justify-end w-full gap-4">
            <Button
              variant="secondary"
              title="Cancel"
              onClick={() => setIsDestructiveModalOpen(false)}
            />
            <Button
              variant="delete"
              title={role === "founder" ? "Delete team" : "Leave team"}
              disabled={deleteTeamMutationIsLoading}
              onClick={() => {
                if (role === "founder") {
                  deleteTeamMutation({ id: team.id });
                } else {
                  leaveTeamMutation(team.id);
                }
              }}
            />
          </div>
        }
      />

      <div className="flex justify-end w-full gap-4">
        {!isPending && role && role !== "member" && (
          <Button
            variant={"secondary"}
            title={role === "founder" ? "Edit team" : "Invite players"}
            onClick={() => {
              setIsTeamUpdateModalOpen(true);
            }}
          />
        )}
        {!isPending && role && (
          <Button
            variant={"delete"}
            title={role === "founder" ? "Delete team" : "Leave team"}
            onClick={() => {
              if (role === "founder") {
                setIsDestructiveModalOpen(true);
              } else {
                if (isPlayerPendingGames) {
                  addToast({
                    type: "error",
                    message: "You cannot leave a team with upcoming games",
                  });
                } else {
                  setIsDestructiveModalOpen(true);
                }
              }
            }}
          />
        )}
      </div>
    </>
  );
};
