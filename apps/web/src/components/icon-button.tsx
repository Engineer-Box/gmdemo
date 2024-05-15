import { cn } from "@/utils/cn";
import { Button } from "./button";
import { IconType } from "./icon";

type IconButtonProps = {
  icon: IconType;
  onClick?: () => void;
  className?: string;
};
export const IconButton = ({ icon, onClick, className }: IconButtonProps) => (
  <Button
    variant="secondary"
    className={cn(
      "bg-brand-navy-light-accent-light py-0.5 px-1 border-brand-navy-light-accent-light",
      className
    )}
    iconSize={20}
    icon={icon}
    onClick={onClick}
  />
);
