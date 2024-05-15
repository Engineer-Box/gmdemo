import { ReactNode, useEffect, useState } from "react";
import * as DialogPrimitives from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ModalOverlay } from "./modal-overlay";
import { ModalContent } from "./modal-content";
import { ModalCard, ModalCardProps } from "./modal-card";

export type ModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  isClosable?: boolean;
  onOverlayClick?: () => void;
} & ModalCardProps;

export const Modal = ({
  isOpen,
  closeModal,
  title,
  isClosable,
  description,
  Top,
  isLoading,
  children,
  onOverlayClick,
  size,
  Footer,
}: ModalProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setContainer(
      document.getElementById("global-modal-root") as HTMLDivElement
    );
  }, []);
  return (
    <div className="relative z-0">
      <DialogPrimitives.Root open={isOpen}>
        <DialogPrimitives.Portal container={container}>
          <div className="z-0 relative">
            <ModalOverlay
              className="z-0"
              onOverlayClick={() => {
                onOverlayClick?.();

                if (isClosable) {
                  if (!isLoading) {
                    closeModal();
                  }
                }
              }}
            />

            <ModalContent>
              {isClosable && (
                <DialogPrimitives.Close asChild>
                  <button
                    disabled={isLoading}
                    onClick={() => closeModal()}
                    className="absolute top-[10px] right-[10px] inline-flex h-7 w-7  appearance-none items-center transition justify-center rounded-full focus:outline-none text-brand-gray hover:bg-white/10 z-10"
                    aria-label="Close"
                  >
                    <Cross2Icon aria-label="Close" />
                  </button>
                </DialogPrimitives.Close>
              )}
              <ModalCard
                Top={Top}
                title={title}
                description={description}
                Footer={Footer}
                size={size}
                isLoading={isLoading}
              >
                {children}
              </ModalCard>
            </ModalContent>
          </div>
        </DialogPrimitives.Portal>
      </DialogPrimitives.Root>
    </div>
  );
};
