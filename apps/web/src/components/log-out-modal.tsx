import { ModalCard } from "./modal/modal-card";
import { Button } from "./button";
import { useAuth } from "@/hooks/use-auth";
import { useGlobalModal } from "@/providers/global-modal-provider";

export const useLogOutModal = () => {
  const { openModal, closeModal } = useGlobalModal();

  const openLogOutModal = () => {
    openModal(<LogOutModal closeModal={closeModal} />, { isClosable: true });
  };

  return { openLogOutModal };
};

type LogOutModalProps = {
  closeModal: () => void;
};

export const LogOutModal = ({ closeModal }: LogOutModalProps) => {
  const { logout } = useAuth();
  return (
    <ModalCard
      size={"sm"}
      title="Log out"
      description="Are you sure you want to log out?"
      Footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            title="Cancel"
            variant={"secondary"}
            onClick={() => {
              closeModal();
            }}
          />
          <Button
            title="Log out"
            variant={"delete"}
            onClick={() => {
              logout();
              closeModal();
            }}
          />
        </div>
      }
    />
  );
};
