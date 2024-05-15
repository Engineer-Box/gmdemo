import { Modal } from "@/components/modal/modal";
import { HomeOrAway } from "../../types";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/providers/toast-provider";
import { USER_QUERY_KEY } from "@/constants";
import { disputeMatch } from "../../service/dispute-match";
import { Copy } from "@/components/copy";
import { CopyMatchId } from "./copy-match-id";
import { getBattle } from "../../service/get-battle";

export const CreateDisputeModal = ({
  isOpen,
  closeModal,
  matchId,
  reportersSide,
  closeParentModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
  reportersSide: HomeOrAway;
  matchId: number;
  closeParentModal: () => void;
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { mutate, isLoading } = useMutation(() => disputeMatch(matchId), {
    onSuccess() {
      addToast({
        message: "Match disputed",
        type: "success",
      });
    },
    onError() {
      addToast({
        message: "Failed to dispute match",
        type: "error",
      });
    },
    onSettled() {
      queryClient.invalidateQueries(getBattle.queryKey());
      queryClient.invalidateQueries(USER_QUERY_KEY);
      closeModal();
      closeParentModal();
    },
  });
  return (
    <div className="relative">
      <Modal
        isLoading={isLoading}
        size={"md"}
        isOpen={isOpen}
        closeModal={closeModal}
        title={"Dispute ticket"}
        description="Are you sure you want to dispute this match? If so please copy the match ID and create a ticket inside our Discord to provide context and proof of the opposing team breaking the rules"
        isClosable
        Footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant={"secondary"}
              title={"Cancel"}
              onClick={closeModal}
            />
            <Button
              variant={"warning"}
              title={"Dispute"}
              onClick={mutate}
            ></Button>
          </div>
        }
      >
        <CopyMatchId matchId={matchId} />
      </Modal>
    </div>
  );
};
