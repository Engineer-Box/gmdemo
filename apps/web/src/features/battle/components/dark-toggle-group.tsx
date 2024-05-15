import React, { useCallback, useMemo } from "react";
import {
  Root,
  Item,
  ToggleGroupMultipleProps,
  ToggleGroupSingleProps,
} from "@radix-ui/react-toggle-group";
import { Text } from "@/components/text";
import { cn } from "@/utils/cn";
import { Control, Controller, ControllerProps } from "react-hook-form";

type DarkToggleGroupProps = {
  options: string[];
  allowMultiple?: boolean;
  getOptionLabel?: (option: string) => string;
} & Pick<ControllerProps<any>, "control" | "defaultValue" | "name">;

export const DarkToggleGroup = ({
  options,
  getOptionLabel,
  name,
  control,
  defaultValue,
  allowMultiple = false,
}: DarkToggleGroupProps) => {
  const getResolvedOptionLabel = useCallback(
    (option: string) => (getOptionLabel ? getOptionLabel(option) : option),
    []
  );

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      defaultValue={defaultValue}
      render={({ field, fieldState: { error } }) => {
        return (
          <Root
            {...field}
            value={field.value}
            onValueChange={field.onChange}
            type={allowMultiple ? "multiple" : "single"}
            orientation={"horizontal"}
          >
            {options.map((option, index) => (
              <Item
                key={option}
                className={cn(
                  "px-2.5 py-1 bg-brand-navy rounded",
                  "border border-solid border-transparent data-[state=on]:border-brand-gray",
                  index !== options.length - 1 && "mr-2",
                  error && "border-brand-status-error"
                )}
                value={option}
                aria-label="Right aligned"
              >
                <Text className={" text-white"}>
                  {getResolvedOptionLabel(option)}
                </Text>
              </Item>
            ))}
          </Root>
        );
      }}
    />
  );
};
