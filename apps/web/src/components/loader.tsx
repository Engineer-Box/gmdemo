import { PropsWithChildren, ReactNode } from "react";

export const Loader = ({
  Loading,
  children,
  isLoading,
}: PropsWithChildren<{ isLoading: boolean; Loading: ReactNode }>) =>
  isLoading ? <>{Loading}</> : <>{children}</>;
