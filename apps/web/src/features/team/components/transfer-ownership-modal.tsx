import { Button } from "@/components/button";
import { ModalCard } from "@/components/modal/modal-card";

type TransferOwnershipModalProps = {
  closeModal: () => void;
  onConfirm: () => void;
};

export const TransferOwnershipModal = ({
  onConfirm,
  closeModal,
}: TransferOwnershipModalProps) => (
  <div className="">
    <ModalCard
      title="Are you sure?"
      description="Are you sure you want to transfer ownership of this team? You will no longer be able to manage this team."
      Footer={
        <div className="flex gap-3 justify-end items-center">
          <Button
            title="Cancel"
            variant={"secondary"}
            onClick={() => {
              closeModal();
            }}
          />
          <Button
            title="Confirm"
            variant={"primary"}
            onClick={() => onConfirm()}
          />
        </div>
      }
    />
  </div>
);
