import { ScrollArea } from "@/components/scroll-area";
import { Dispatch, SetStateAction, useEffect } from "react";
import { TeamSelectionRow } from "./team-selection-row";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/providers/toast-provider";
import { Button } from "@/components/button";
import { StrapiError } from "@/utils/strapi-error";
import { USER_QUERY_KEY } from "@/constants";
import { Skeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import { getTeam } from "@/features/team/service/get-team";

type ContentProps = {
  teamSelection: number[];
  setTeamSelection: Dispatch<SetStateAction<number[]>>;
  teamId: number;
  captainsTeamProfileId: number;
  teamSize: number;
  wagerAmountPerPersonInCents: number;
};

const Content = ({
  teamId,
  teamSelection,
  setTeamSelection,
  captainsTeamProfileId,
  teamSize,
  wagerAmountPerPersonInCents,
}: ContentProps) => {
  const { addToast } = useToast();
  const {
    data: teamData,
    isLoading: teamDataIsLoading,
    isError: teamDataIsError,
  } = useQuery(["team", teamId], () => getTeam(teamId), {});

  useEffect(() => {
    if (!teamData) return;
    const teamProfiles = teamData.data.attributes.team_profiles.data;
    setTeamSelection((p) =>
      p.filter(
        (teamSelectionProfileId) =>
          !!teamProfiles?.find((tp) => tp.id === teamSelectionProfileId)
      )
    );
  }, [teamSelection.length, teamData]);

  useEffect(() => {
    if (teamDataIsError) {
      addToast({
        type: "error",
        message: "An error occurred while fetching team data",
      });
    }
  }, [teamDataIsError]);

  if (teamDataIsLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton dark className="w-[100%] h-3.5" />
        <Skeleton dark className="w-[100%] h-3.5" />
        <Skeleton dark className="w-[100%] h-3.5" />
      </div>
    );
  }
  return (
    <ScrollArea viewportClassName="max-h-56" type="always">
      <div className="flex flex-col gap-3">
        {teamData?.data &&
          teamData?.data.attributes.team_profiles.data
            ?.filter((tp) => !tp.attributes.is_pending)
            .map((tp) => (
              <TeamSelectionRow
                key={tp.id}
                isCaptain={tp.id === captainsTeamProfileId}
                teamSelection={teamSelection}
                teamProfile={tp}
                setTeamSelection={setTeamSelection}
                teamSize={teamSize}
                wagerAmountPerPersonInCents={wagerAmountPerPersonInCents}
              />
            ))}
      </div>
    </ScrollArea>
  );
};

type FooterProps = {
  closeModal: () => void;
  teamId: number;
  onBack: () => void;
  mutation: any;
  teamSize: number;
  teamSelection: number[];
  setTeamSelection: Dispatch<SetStateAction<number[]>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  onSuccess?: () => void;
};

const Footer = ({
  setIsLoading,
  closeModal,
  teamId,
  onBack,
  mutation,
  teamSize,
  setTeamSelection,
  onSuccess,
  teamSelection,
}: FooterProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { mutate, isLoading } = useMutation(mutation, {
    onSuccess() {
      onSuccess?.();

      queryClient.invalidateQueries(USER_QUERY_KEY);
      queryClient.invalidateQueries({ queryKey: ["get-joinable-battles"] });

      closeModal();
    },
    async onError(error) {
      const strapiError = StrapiError.isStrapiError(error) ? error : null;

      const squadNotEligible =
        strapiError?.error.message === "SquadNotEligible";

      const battleUnavailable =
        strapiError?.error.message === "BattleUnavailable";

      if (battleUnavailable) {
        addToast({
          type: "error",
          message: "This battle is no longer available",
        });

        closeModal();
      } else if (squadNotEligible) {
        setTeamSelection([]);
        // invalidate the team query
        queryClient.refetchQueries({
          queryKey: ["team", teamId],
          exact: true,
        });

        addToast({
          type: "warning",
          message: "One or more of the selected team members are not eligible",
        });
      } else {
        if ((error as any)?.message) {
          addToast({
            type: "error",
            message: (error as any)?.message,
          });
        } else {
          addToast({
            type: "error",
            message: "Something went wrong",
          });
        }

        closeModal();
      }
    },
  });

  useEffect(() => {
    setIsLoading(isLoading);
  }, [isLoading]);

  return (
    <>
      <Button variant={"secondary"} title="Back" onClick={onBack} />
      <Button
        title="Confirm"
        disabled={teamSelection.length + 1 !== teamSize}
        onClick={mutate}
      />
    </>
  );
};

export const SelectSquadModalStep = {
  Content,
  Footer,
};
