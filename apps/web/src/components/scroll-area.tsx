import React, { PropsWithChildren } from "react";
import * as ScrollAreaPrimitives from "@radix-ui/react-scroll-area";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";

const HIDE_SCROLLBAR_DELAY = 600;

export const ScrollArea = ({
  children,
  viewportClassName,
  type = "hover",
  variant = "light",
}: PropsWithChildren<{
  viewportClassName?: string;
  variant?: "dark" | "light";
  type?: ScrollAreaPrimitives.ScrollAreaProps["type"];
}>) => {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(
    type === "always"
  );

  useEffect(() => {
    if (type === "always") return;
    if (isMouseOver && !isScrollbarVisible) {
      setIsScrollbarVisible(true);
    }

    if (!isMouseOver && isScrollbarVisible) {
      setTimeout(() => {
        setIsScrollbarVisible(false);
      }, HIDE_SCROLLBAR_DELAY);
    }
  }, [isMouseOver, isScrollbarVisible]);

  return (
    <ScrollAreaPrimitives.Root
      onMouseOver={() => setIsMouseOver(true)}
      onMouseOut={() => setIsMouseOver(false)}
      type={type}
      scrollHideDelay={HIDE_SCROLLBAR_DELAY}
    >
      <ScrollAreaPrimitives.Viewport
        className={cn(
          "w-full h-full",
          isScrollbarVisible && "pr-4",
          viewportClassName
        )}
      >
        {children}
      </ScrollAreaPrimitives.Viewport>
      <ScrollAreaPrimitives.Scrollbar
        className="select-none touch-none bg-transparent transition-color ease-out hover:bg-brand-navy/50 w-2"
        orientation="vertical"
      >
        <ScrollAreaPrimitives.Thumb
          className={cn(
            "bg-brand-navy rounded opacity-0 data-[state=visible]:opacity-100 transition-opacity",
            variant === "dark" && "bg-brand-navy-accent-dark"
          )}
        ></ScrollAreaPrimitives.Thumb>
      </ScrollAreaPrimitives.Scrollbar>
    </ScrollAreaPrimitives.Root>
  );
};
