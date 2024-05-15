import { cn } from "@/utils/cn";
import * as SeparatorPrimitives from "@radix-ui/react-separator";

type SeparatorProps = {
  className?: string;
} & SeparatorPrimitives.SeparatorProps;

export const Separator = ({ className, ...props }: SeparatorProps) => (
  <SeparatorPrimitives.Root
    {...props}
    className={cn(
      "bg-brand-navy-light-accent-light data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:h-0.5  data-[orientation=horizontal]:w-full",
      className
    )}
  />
);
