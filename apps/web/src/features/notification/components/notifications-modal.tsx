import * as DialogPrimitives from "@radix-ui/react-dialog";
import { NotificationsContent } from "./notifications-content";
import { ModalOverlay } from "@/components/modal/modal-overlay";
import { ModalContent } from "@/components/modal/modal-content";

type NotificationsModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};
export const NotificationsModal = ({
  isOpen,
  setIsOpen,
}: NotificationsModalProps) => {
  return (
    <div className="relative z-0">
      <DialogPrimitives.Root open={isOpen} onOpenChange={(v) => setIsOpen(v)}>
        <DialogPrimitives.Portal>
          <div className="relative z-0">
            <ModalOverlay />
            <DialogPrimitives.Content className="z-20 w-[90%] top-24 translate-y-0 fixed left-[50%] -translate-x-[50%]">
              <NotificationsContent
                onMarkAllReadClick={() => setIsOpen(false)}
                onNotificationClick={() => setIsOpen(false)}
              />
            </DialogPrimitives.Content>
          </div>
        </DialogPrimitives.Portal>
      </DialogPrimitives.Root>
    </div>
  );
};
