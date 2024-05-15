import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect } from "react";
import { useGlobalModal } from "./global-modal-provider";
import { ModalCard } from "@/components/modal/modal-card";

export const SuspensionModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useAuth();
  const isSuspended = user?.data.profile.suspended;
  const { openModal } = useGlobalModal();

  useEffect(() => {
    if (isSuspended) {
      openModal(
        <ModalCard
          title="Account Suspended"
          description="Your account has been suspended. Please contact support for more information"
        />,
        { isClosable: false }
      );
    }
  }, [isSuspended]);

  return <>{children}</>;
};
