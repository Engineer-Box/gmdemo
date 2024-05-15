import * as TooltipPrimitives from "@radix-ui/react-tooltip";
import { PropsWithChildren, ReactNode } from "react";

export const Tooltip = ({
  content,
  children,
  side = "left",
}: PropsWithChildren<{
  content?: string;
  side?: "top" | "right" | "bottom" | "left";
}>) => (
  <TooltipPrimitives.Provider>
    <TooltipPrimitives.Root delayDuration={0} open={!!content?.length}>
      <TooltipPrimitives.Trigger asChild>{children}</TooltipPrimitives.Trigger>
      <TooltipPrimitives.Portal>
        {content && (
          <TooltipPrimitives.Content
            className="data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade select-none rounded-[4px] bg-brand-navy px-[15px] py-[10px] text-[14px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity] text-brand-gray"
            sideOffset={5}
            side={side}
          >
            {content}
            <TooltipPrimitives.Arrow className="fill-brand-navy" />
          </TooltipPrimitives.Content>
        )}
      </TooltipPrimitives.Portal>
    </TooltipPrimitives.Root>
  </TooltipPrimitives.Provider>
);
