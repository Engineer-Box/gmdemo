import { ReactNode } from "react";
import * as DialogPrimitives from "@radix-ui/react-dialog";
import { Heading } from "../heading";
import { Text } from "../text";
import { Spinner } from "../spinner";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { ModalFooter } from "./modal-footer";

const modalVariants = cva("max-h-[85vh] w-full", {
  variants: {
    size: {
      sm: "w-[380px]",
      md: "w-[440px]",
      lg: "w-[550px]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ModalCardProps = {
  Top?: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  isLoading?: boolean;
  Footer?: ReactNode;
} & VariantProps<typeof modalVariants>;

export const ModalCard = ({
  Top,
  title,
  description,
  isLoading,
  children,
  size,
  Footer,
}: ModalCardProps) => {
  return (
    <div
      className={cn(
        "pt-7 relative z-0 rounded-lg shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] bg-brand-navy-light",
        modalVariants({ size })
      )}
    >
      {!!Top && <div className="mb-3 px-7">{Top}</div>}
      <DialogPrimitives.Title className="px-7">
        <Heading variant="h2" className="mb-3">
          {title}
        </Heading>
      </DialogPrimitives.Title>
      {description && (
        <DialogPrimitives.Description className="px-7">
          <Text>{description}</Text>
        </DialogPrimitives.Description>
      )}
      <div className="z-30 mt-6 mb-4 px-7">{children}</div>
      {Footer && <ModalFooter>{Footer}</ModalFooter>}
      {!Footer && <div className="pb-3" />}
      <div
        className={cn(
          "absolute flex transition-colors items-center justify-center rounded bg-brand-navy/0",
          isLoading && "visible inset-0 bg-brand-navy/50"
        )}
      >
        {isLoading && <Spinner />}
      </div>
    </div>
  );
};
