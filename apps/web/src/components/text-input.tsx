import React, { InputHTMLAttributes, forwardRef } from "react";
import { InputLayout } from "./input-layout";
import { IconType } from "./icon";
import { cn } from "@/utils/cn";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { textVariantClassnames } from "./text";
import { ClassValue } from "clsx";

type TextInputProps = {
  icon?: IconType;
  error?: FieldError | boolean;
  defaultValue?: string;
  disabled?: boolean;
  containerClassName?: ClassValue;
  errorTextClassName?: ClassValue;
  inputClassName?: ClassValue;
  placeholder?: string;
} & InputHTMLAttributes<HTMLInputElement> &
  UseFormRegisterReturn;

export const TextInput = forwardRef<any, TextInputProps>(
  (
    {
      icon,
      error,
      defaultValue,
      disabled,
      containerClassName,
      inputClassName,
      errorTextClassName,
      ...inputProps
    },
    ref
  ) => {
    const errorMessage =
      typeof error === "boolean"
        ? undefined
        : error?.message?.length
          ? error.message
          : undefined;
    const wasError = !!error;

    return (
      <InputLayout
        icon={icon}
        error={errorMessage ?? wasError}
        errorTextClassName={errorTextClassName}
        className={containerClassName}
      >
        <input
          autoComplete="off"
          type="text"
          defaultValue={defaultValue}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          className={cn(
            textVariantClassnames.p,
            "h-full w-full bg-transparent placeholder:text-brand-gray outline-none focus:outline-none text-brand-white",
            error &&
              "border-brand-status-error focus:border-brand-status-error",
            inputClassName
          )}
          {...inputProps}
          ref={ref}
        />
      </InputLayout>
    );
  }
);

TextInput.displayName = "TextInput";
