import { RegistrationModal } from "@/components/registration-modal";
import { useAuth } from "@/hooks/use-auth";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const RegistrationModalProviderContext = createContext<{
  open(): void;
  close(): void;
  isOpen: boolean;
}>({
  isOpen: false,
  close() {},
  open() {},
});

export const useRegistrationModal = () => {
  return useContext(RegistrationModalProviderContext);
};

export const RegistrationModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, completedRegistration } = useAuth();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const shouldShowModal = user && !completedRegistration;
    setIsOpen(!!shouldShowModal);
  }, [user]);

  return (
    <RegistrationModalProviderContext.Provider value={{ isOpen, close, open }}>
      <RegistrationModal />
      {children}
    </RegistrationModalProviderContext.Provider>
  );
};
