import { Button } from "@/components/button";
import { Modal, ModalProps } from "@/components/modal/modal";
import { Text } from "@/components/text";
import { TextInput } from "@/components/text-input";
import { UseFormRegisterReturn } from "react-hook-form";

export const GamerTagModal = ({
  title,
  description,
  isLoading,
  isOpen,
  closeModal,
  errorMessage,
  isTagNameInputError,
  FooterButton,
  children,
  tagNameInputRegister,
}: {
  isTagNameInputError: boolean;
  errorMessage?: string | null;
  tagNameInputRegister: UseFormRegisterReturn<"tagName">;
  FooterButton?: React.ReactNode;
} & Pick<
  ModalProps,
  "title" | "description" | "isLoading" | "isOpen" | "closeModal" | "children"
>) => {
  return (
    <Modal
      title={title}
      description={description}
      isLoading={isLoading}
      isOpen={isOpen}
      closeModal={closeModal}
      isClosable
      size={"sm"}
      Footer={
        <div className="flex justify-end gap-2">
          <Button title="Cancel" variant="secondary" onClick={closeModal} />
          {FooterButton}
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {children}
        <TextInput error={isTagNameInputError} {...tagNameInputRegister} />
        {errorMessage && (
          <Text className="font-semibold text-brand-status-error">
            {errorMessage}
          </Text>
        )}
      </div>
    </Modal>
  );
};
