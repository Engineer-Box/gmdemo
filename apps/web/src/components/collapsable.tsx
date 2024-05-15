import { ReactNode } from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

type CollapsableProps = {
  children: [ReactNode, ReactNode];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const Collapsable = ({
  isOpen,
  setIsOpen,
  children,
}: CollapsableProps) => (
  <CollapsiblePrimitive.Root
    open={isOpen}
    onOpenChange={(openVal) => setIsOpen(openVal)}
  >
    <CollapsiblePrimitive.Trigger className="w-full cursor-pointer" asChild>
      {children[0]}
    </CollapsiblePrimitive.Trigger>
    <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsableHide data-[state=open]:animate-collapsableShow">
      {children[1]}
    </CollapsiblePrimitive.Content>
  </CollapsiblePrimitive.Root>
);
