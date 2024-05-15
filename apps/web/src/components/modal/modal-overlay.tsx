import { cn } from "@/utils/cn";
import { Overlay as OverlayPrimitive } from "@radix-ui/react-dialog";
import { ClassValue } from "clsx";

type ModalOverlayProps = {
  onOverlayClick?: () => void;
  className?: ClassValue;
};
export const ModalOverlay = ({
  onOverlayClick,
  className,
}: ModalOverlayProps) => (
  <OverlayPrimitive
    className={cn(
      "bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 backdrop-blur-sm",
      className
    )}
    onClick={() => {
      onOverlayClick?.();
    }}
  />
);
