import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";
import { HTMLAttributes, ReactNode, forwardRef, useMemo, useRef } from "react";
import { Skeleton } from "./skeleton";
import { ConditionallyWrap } from "./conditionally-wrap";
import { VariantProps, cva } from "class-variance-authority";

export const headingVariants = cva("text-brand-white font-accent", {
  variants: {
    variant: {
      h1: "text-3xl md:text-4xl font-bold mb-10",
      h2: "text-2xl font-bold mb-0",
      h3: "text-xl font-semibold mb-3",
      h4: "",
      h5: "font-semibold text-md",
    },
  },
});

type HeadingProps = {
  className?: ClassValue;
  children?: ReactNode;
} & HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants>;

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ variant, className, children, ...attributes }, ref) => {
    const resolvedVariant = variant ?? "h1";
    const Tag = useMemo(() => resolvedVariant, [resolvedVariant]);

    return (
      <Tag
        ref={ref}
        className={cn(headingVariants({ variant }), className)}
        {...attributes}
      >
        {children}
      </Tag>
    );
  }
);

Heading.displayName = "Heading";
