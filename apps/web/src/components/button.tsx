import { ClassValue } from "clsx";
import { ReactNode } from "react";
import { Icon, IconType } from "./icon";
import { cn } from "@/utils/cn";
import { Text } from "./text";
import { cva, VariantProps } from "class-variance-authority";

// TODO: Size should also affect the icon size
export const buttonVariants = cva(
  "cursor-pointer inline-flex  items-center justify-center gap-3 border-2 border-transparent rounded transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-primary text-brand-white hover:bg-brand-primary-dark active:border-brand-primary",
        secondary:
          "bg-brand-navy-light text-brand-gray hover:text-white border-brand-navy-light active:border-black/40",
        delete:
          "bg-brand-red text-white hover:bg-brand-red-dark active:border-brand-red",
        warning:
          "bg-brand-status-warning-secondary active:border-brand-status-warning-text active:bg-brand-status-warning-secondary hover:bg-brand-status-warning-secondary/85 text-brand-status-warning-text ",
        unstyled: "border-transparent",
      },
      disabled: {
        true: "opacity-70 pointer-events-none",
        false: "",
      },

      size: {
        sm: "text-sm px-[4px] py-[2px]",
        md: "text-sm px-[12px] py-[10px] ",
        lg: "text-lg",
      },
    },
    // Purposefully empty so that by default we can extend with custom styles
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
    compoundVariants: [{}],
  }
);

// TODO: start accepting html attributes
type ButtonProps = {
  className?: ClassValue;
  icon?: ReactNode | IconType;
  children?: ReactNode;
  title?: string;
  onClick?: () => void;
  iconSize?: number;
} & VariantProps<typeof buttonVariants>;

export const Button = ({
  title,
  onClick,
  disabled,
  children,
  icon,
  variant,
  className,
  size,
  iconSize = 16,
}: ButtonProps) => {
  const buttonSizeStyles = {
    width: iconSize,
    height: iconSize,
    maxWidth: iconSize,
    maxHeight: iconSize,
  };
  return (
    <button
      onClick={onClick}
      className={cn(buttonVariants({ variant, disabled, size }), className)}
    >
      {icon && typeof icon === "string" && (
        <Icon size={iconSize} icon={icon as IconType} />
      )}
      {icon && typeof icon !== "string" && (
        <div style={buttonSizeStyles}>{icon}</div>
      )}
      {title && <p>{title}</p>}
      {children}
    </button>
  );
};
