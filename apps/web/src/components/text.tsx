import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";
import { HTMLAttributes, ReactNode, forwardRef, useMemo, useRef } from "react";
import { Skeleton, SkeletonProps } from "./skeleton";

export const textVariantClassnames = {
  p: "text-sm text-brand-gray font-standard",
  label: "text-sm text-brand-white font-standard font-semibold",
};

type TextProps = {
  variant?: keyof typeof textVariantClassnames;
} & {
  className?: ClassValue;
  children: ReactNode;
} & HTMLAttributes<HTMLParagraphElement>;

export const TextSkeleton = ({
  className,
  ...rest
}: { className?: ClassValue } & Pick<SkeletonProps, "dark">) => {
  return <Skeleton className={cn("h-3", className)} {...rest} />;
};

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ variant = "p", className, children, ...attributes }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(textVariantClassnames[variant], className)}
        {...attributes}
      >
        {children}
      </p>
    );
  }
);

Text.displayName = "Text";
