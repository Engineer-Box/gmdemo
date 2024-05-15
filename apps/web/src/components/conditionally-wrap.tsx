import { PropsWithChildren, ReactNode } from "react";

type ConditionallyWrap = {
  condition: boolean | undefined;
  children: ReactNode;
  Wrapper: React.FC<any>;
};
export const ConditionallyWrap = ({
  condition,
  children,
  Wrapper,
}: ConditionallyWrap) => (
  <>{condition ? <Wrapper>{children}</Wrapper> : children}</>
);
