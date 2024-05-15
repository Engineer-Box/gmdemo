import Link from "next/link";
import { ConditionallyWrap } from "./conditionally-wrap";
import { MouseEventHandler, PropsWithChildren } from "react";

type DetailedLink = {
  href: string;
  isExternal: boolean;
};

export type ClickableProps = PropsWithChildren<{
  action: string | MouseEventHandler<HTMLDivElement> | DetailedLink;
}>;

export const Clickable = ({ action, children }: ClickableProps) => {
  return (
    <ConditionallyWrap
      condition={typeof action !== "function"}
      Wrapper={({ children }) => (
        <Link
          href={
            typeof action === "string" ? action : (action as DetailedLink).href
          }
          target={
            typeof action === "string"
              ? undefined
              : (action as DetailedLink).isExternal
              ? "_blank"
              : undefined
          }
        >
          {children}
        </Link>
      )}
    >
      <ConditionallyWrap
        condition={typeof action === "function"}
        Wrapper={({ children }) => (
          <div onClick={action as MouseEventHandler<HTMLDivElement>}>
            {children}
          </div>
        )}
      >
        {children}
      </ConditionallyWrap>
    </ConditionallyWrap>
  );
};
