import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import * as DialogPrimitives from "@radix-ui/react-dialog";
import { ModalOverlay } from "@/components/modal/modal-overlay";
import { Cross2Icon } from "@radix-ui/react-icons";

// TODO: Implement priorities - highPriorityModals, modals

type GlobalModalType = {
  id: string;
  Modal: ReactNode;
  options?: Partial<{
    isClosable: boolean;
    onOverlayClick: () => void;
  }>;
};
type GlobalModalContextType = {
  setModals: Dispatch<SetStateAction<GlobalModalType[]>>;
  modals: GlobalModalType[];
  openModal: (props: GlobalModalType) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
};

const GlobalModalContext = createContext<GlobalModalContextType>({
  setModals() {},
  modals: [],
  openModal() {},
  closeModal() {},
  closeAllModals() {},
});

export const useGlobalModal = (staticId?: string) => {
  const dynamicId = useId();
  const id = staticId ?? dynamicId;

  const modalContext = useContext(GlobalModalContext);

  const openModal = (
    Modal: ReactNode,
    options?: GlobalModalType["options"]
  ) => {
    modalContext.openModal({
      id,
      Modal,
      options,
    });
  };

  const closeModal = (customId?: string) => {
    const idToClose = customId ?? id;
    modalContext.closeModal(idToClose);
  };

  return { openModal, closeModal } as const;
};

export const GlobalModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<GlobalModalType[]>([]);
  const activeModal = modals.length > 0 ? modals[modals.length - 1] : null;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setContainer(
      document.getElementById("global-modal-root") as HTMLDivElement
    );
  }, []);

  const openModal = (props: GlobalModalType) => {
    setModals((prev) => [
      ...prev.filter((modal) => modal.id !== props.id),
      props,
    ]);
  };

  const closeModal = (id: string) => {
    setModals((prev) => {
      const index = prev.findIndex((modal) => modal.id === id);
      if (index === -1) return prev;

      const sliced = prev.slice(0, index);
      return sliced;
    });
  };

  const closeAllModals = () => {
    setModals([]);
  };

  return (
    <GlobalModalContext.Provider
      value={{
        openModal,
        closeModal,
        closeAllModals,
        modals,
        setModals,
      }}
    >
      <DialogPrimitives.Root open={!!activeModal}>
        <DialogPrimitives.Portal container={container}>
          <div className="relative z-0">
            <ModalOverlay
              className="z-10"
              onOverlayClick={() => {
                const modalOptions = activeModal?.options;

                if (!modalOptions) return;
                modalOptions.onOverlayClick?.();

                if (modalOptions.isClosable) {
                  closeModal(activeModal.id);
                }
              }}
            />

            <DialogPrimitives.Content className="z-20 data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] focus:outline-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%">
              {activeModal?.options?.isClosable && (
                <DialogPrimitives.Close asChild>
                  <button
                    onClick={() => {
                      closeModal(activeModal.id);
                    }}
                    className="absolute top-[10px] right-[10px] inline-flex h-7 w-7  appearance-none items-center transition justify-center rounded-full focus:outline-none text-brand-gray hover:bg-white/10 z-10"
                    aria-label="Close"
                  >
                    <Cross2Icon aria-label="Close" />
                  </button>
                </DialogPrimitives.Close>
              )}
              {activeModal && activeModal.Modal}
            </DialogPrimitives.Content>
          </div>
        </DialogPrimitives.Portal>
      </DialogPrimitives.Root>

      {children}
    </GlobalModalContext.Provider>
  );
};
