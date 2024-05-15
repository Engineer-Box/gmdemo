import { cn } from "@/utils/cn";
import { Content as ContentPrimitive } from "@radix-ui/react-dialog";
import { ClassValue } from "clsx";
import { PropsWithChildren } from "react";

type ModalContentProps = PropsWithChildren<{
  className?: ClassValue;
}>;
export const ModalContent = ({ className, children }: ModalContentProps) => (
  <ContentPrimitive
    className={cn(
      "data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] focus:outline-none",
      className
    )}
  >
    {children}
  </ContentPrimitive>
);
