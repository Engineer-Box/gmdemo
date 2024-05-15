import { cn } from "@/utils/cn";
import { VariantProps, cva } from "class-variance-authority";
import { ClassValue } from "clsx";
import { ReactNode } from "react";

const badgeVariants = cva(
  "px-[6px] py-[1px] inline-block text-sm rounded-[7px] min-w-8 text-center",
  {
    variants: {
      colorScheme: {
        emerald: "bg-emerald-100 text-emerald-950",
        rose: "bg-rose-100 text-rose-950",
        violet: "bg-violet-300 text-brand-primary-dark",
        warning:
          "bg-brand-status-warning-secondary text-brand-status-warning-text",
      },
    },
  }
);

export const Badge = ({
  children,
  colorScheme,
  className,
  textClassName,
}: {
  children: ReactNode;
  className?: ClassValue;
  textClassName?: string;
} & VariantProps<typeof badgeVariants>) => (
  <div className={cn(badgeVariants({ colorScheme }), className)}>
    <p className={cn("font-medium", textClassName)}>{children}</p>
  </div>
);
