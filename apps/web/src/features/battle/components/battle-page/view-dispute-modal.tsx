import { Modal } from "@/components/modal/modal";
import { CopyMatchId } from "./copy-match-id";
import { Button } from "@/components/button";

export const ViewDisputeModal = ({
  matchId,
  isOpen,

  closeModal,
}: {
  matchId: number;
  isOpen: boolean;
  closeModal: () => void;
}) => (
  <Modal
    isClosable
    isOpen={isOpen}
    size={"sm"}
    closeModal={closeModal}
    title="Dispute"
    description="The match result is disputed. Please copy the match ID and create a ticket in our Discord server."
    Footer={
      <div className="flex justify-end">
        <Button variant={"primary"} title={"Close"} onClick={closeModal} />
      </div>
    }
  >
    <CopyMatchId matchId={matchId} />
  </Modal>
);
