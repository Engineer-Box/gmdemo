import { HTMLAttributes, ReactNode, forwardRef } from "react";
import { Icon, IconType } from "./icon";
import { ClassValue } from "clsx";
import { cn } from "@/utils/cn";
import { textVariantClassnames } from "./text";

type InputLayoutProps = {
  icon?: IconType;
  error?: string | boolean;
  children: ReactNode;
  autoHeight?: boolean;
  disabled?: boolean;
  className?: ClassValue;
  errorTextClassName?: ClassValue;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

export const InputLayout = forwardRef<HTMLDivElement, InputLayoutProps>(
  (
    {
      icon,
      error,
      children,
      autoHeight,
      disabled,
      errorTextClassName,
      className,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === "string" ? error : undefined;
    const wasError = !!error;

    return (
      <>
        <div
          {...props}
          ref={ref}
          className={cn(
            "flex pl-[12px] transition-all items-center bg-brand-navy border gap-3 border-brand-navy focus-within:border-brand-gray-dark flex-nowrap rounded overflow-hidden text-brand-gray",
            autoHeight ? "h-auto" : "h-12",
            wasError &&
              "border-brand-status-error focus-within:border-brand-status-error",
            disabled && "opacity-70 pointer-events-none",
            className
          )}
        >
          {icon && <Icon icon={icon} size={16} />}
          <div
            className={cn(
              textVariantClassnames.p,
              "placeholder:text-brand-gray w-full min-h-full max-h-full h-full focus:bg-red-600 pr-[12px] [&>*]:py-[10px]"
            )}
          >
            {children}
          </div>
        </div>
        {errorMessage && !disabled && (
          <span
            className={cn(
              "block mt-2 text-brand-status-error",
              errorTextClassName
            )}
          >
            {errorMessage}
          </span>
        )}
      </>
    );
  }
);

InputLayout.displayName = "InputLayout";
