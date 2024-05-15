import { Button } from "@/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/providers/toast-provider";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useNotifications } from "@/features/notification/use-notifications";
import { isTeamInviteReceivedNotification } from "@/features/notification/notification-service";
import { USER_QUERY_KEY } from "@/constants";
import { CreateGamerTagModal } from "@/features/gamer-tag/components/create-gamer-tag-modal";
import { TeamPageContent } from "./team-page-content";
import { Modal } from "@/components/modal/modal";
import { getTeamsForProfile } from "../service/get-teams-for-profile";
import { respondToInvite } from "../service/respond-to-invite";

type TeamInviteReceivedModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  teamProfile: TeamPageContent["teamProfile"];
};

export const TeamInviteReceivedModal = ({
  teamProfile,
  isOpen,
  closeModal,
}: TeamInviteReceivedModalProps) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const [isCreateGamerTagModalOpen, setIsCreateGamerTagModalOpen] =
    useState(false);
  const teamId = teamProfile?.attributes.team.data?.id!;
  const teamName = teamProfile?.attributes.team.data?.attributes.name!;
  const invitedBy =
    teamProfile?.attributes.invited_by.data?.attributes.username! ?? "User";
  const game = teamProfile?.attributes.team.data?.attributes.game;
  const teamProfileId = teamProfile?.id;
  const profileId = user?.data.profile.id;
  const {
    data: teamsForProfileData,
    isLoading: isTeamsForProfileLoading,
    isSuccess: teamsForProfileIsSuccess,
  } = useQuery(
    ["teams-for-profile", profileId],
    () => getTeamsForProfile(profileId!),
    {
      enabled: !!profileId,
      onError() {
        addToast({
          type: "error",
          message: "Something went wrong, please try again later.",
        });
        closeModal();
      },
    }
  );

  const { mutate: respondToTeamInviteMutation } = useMutation(
    async ({ accept }: { accept: boolean }) => {
      const linkedTeamInviteReceivedNotification = notifications.find(
        (n) =>
          isTeamInviteReceivedNotification(n) &&
          n.attributes.team.data?.id === teamId
      );

      await respondToInvite(teamProfileId!, accept);

      if (linkedTeamInviteReceivedNotification?.id) {
        await markAsRead(linkedTeamInviteReceivedNotification.id);
      }
    },
    {
      onSuccess(data, variables, context) {
        queryClient.invalidateQueries(USER_QUERY_KEY);
        queryClient.invalidateQueries(["team", teamId]);

        if (!variables.accept) {
          router.push(`/team/${teamId}`);
        }

        addToast({
          type: "success",
          message: `You have ${
            variables.accept ? "accepted" : "declined"
          } the invite`,
        });
      },
      onSettled() {
        closeModal();
      },
    }
  );

  const onAcceptButtonClick = () => {
    const hasGamerTagForGame = user?.data.profile.gamer_tags.data?.some(
      (gt) => gt.attributes.game.data?.id === game?.data?.id
    );

    if (hasGamerTagForGame) {
      const teamForProfileAndGame =
        teamsForProfileData?.data.find(
          (team) => team.attributes.game.data?.id === game?.data?.id
        ) ?? null;

      if (teamForProfileAndGame) {
        addToast(
          {
            type: "error",
            message:
              "You can't join this team as you're already on a roster for this ladder",
            button: {
              label: "Team page",
              onClick() {
                router.push(`/team/${teamForProfileAndGame.id}`);
                closeModal();
              },
            },
          },
          "team-invite-received-modal-error-toast"
        );
      } else {
        respondToTeamInviteMutation({
          accept: true,
        });
        closeModal();
      }
    } else {
      setIsCreateGamerTagModalOpen(true);
    }
  };

  return (
    <>
      <CreateGamerTagModal
        isOpen={isCreateGamerTagModalOpen}
        fixedGameId={game?.data?.id}
        closeModal={() => setIsCreateGamerTagModalOpen(false)}
        onSuccess={() => {
          setIsCreateGamerTagModalOpen(false);
          respondToTeamInviteMutation({
            accept: true,
          });
        }}
      />
      <Modal
        isOpen={isOpen}
        closeModal={closeModal}
        isClosable
        title={`Join ${teamName}`}
        size="sm"
        description={`${invitedBy} has invited you to join their team, if you do not know this person decline this invite.`}
        Footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant={"secondary"}
              title="Decline"
              onClick={() => {
                respondToTeamInviteMutation({
                  accept: false,
                });
              }}
            />
            <Button
              variant={"primary"}
              title="Accept"
              disabled={!teamsForProfileIsSuccess}
              onClick={onAcceptButtonClick}
            />
          </div>
        }
      />
    </>
  );
};
