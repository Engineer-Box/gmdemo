import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";
import { ReactNode } from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

type ShowProps = {
  children: ReactNode;
  className?: ClassValue;
} & (
  | {
      above: Breakpoint;
    }
  | { below: Breakpoint }
);

export const Show = ({ children, className, ...rest }: ShowProps) => {
  const isAbove = "above" in rest;
  const bpValue = isAbove ? rest.above : rest.below;

  return (
    <div
      className={cn(
        bpValue === "sm" && (isAbove ? "hidden sm:block" : "block sm:hidden"),
        bpValue === "md" && (isAbove ? "hidden md:block" : "block md:hidden"),
        bpValue === "lg" && (isAbove ? "hidden lg:block" : "block lg:hidden"),
        bpValue === "xl" && (isAbove ? "hidden xl:block" : "block xl:hidden"),
        bpValue === "2xl" &&
          (isAbove ? "hidden 2xl:block" : "block 2xl:hidden"),
        className
      )}
    >
      {children}
    </div>
  );
};
