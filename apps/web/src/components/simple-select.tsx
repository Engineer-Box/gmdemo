import { cn } from "@/utils/cn";
import * as SelectPrimitive from "@radix-ui/react-select";
import { textVariantClassnames } from "./text";
import { Icon, IconType } from "./icon";
import { ClassValue } from "clsx";
import { useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

type CustomOption = {
  option: string;
  triggerClassName?: ClassValue;
  optionClassName?: ClassValue;
  icon?: IconType;
};

type Option = string | CustomOption;

export type SimpleSelectProps = {
  options: Option[];
  value: string | undefined;
  setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
  placeholder?: string;
  disabled?: boolean;
  viewportMatchTriggerWidth?: boolean;
  triggerClassName?: ClassValue;
  itemClassName?: ClassValue;
  disabledOptions?: string[];
  maxHeight?: number;
  getOptionLabel?: (value: string) => string; // Allows you to pass in an ID as the option value and then get the label from the ID
};

export const SimpleSelect = ({
  options,
  value,
  setValue,
  triggerClassName,
  viewportMatchTriggerWidth,
  disabled,
  itemClassName,
  maxHeight,
  disabledOptions = [],
  placeholder,
  getOptionLabel = (value) => value,
}: SimpleSelectProps) => {
  const isOptionDisabled = (option: string) => disabledOptions.includes(option);

  const resolvedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string" ? { option } : option
      ) as CustomOption[],
    [options]
  );

  const triggerClassNameFromOption = useMemo(
    () =>
      resolvedOptions.find((option) => option.option === value)
        ?.triggerClassName || "",
    [resolvedOptions, value]
  );

  return (
    <SelectPrimitive.Root
      disabled={disabled}
      value={value}
      onValueChange={(v) => {
        setValue(v);
      }}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "min-w-min outline-none focus:outline-none flex items-center gap-3",
          textVariantClassnames.p,
          triggerClassName,
          triggerClassNameFromOption,
          "data-[placeholder]:text-opacity-80"
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} className="" />
        {!disabled && (
          <SelectPrimitive.Icon asChild>
            <Icon icon="chevron-down" size={12} />
          </SelectPrimitive.Icon>
        )}
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "z-50",
            viewportMatchTriggerWidth &&
              "min-w-[var(--radix-select-trigger-width)]"
          )}
          position="popper"
          sideOffset={8}
          side="bottom"
        >
          <SelectPrimitive.ScrollUpButton className="absolute flex w-full items-center border-b-brand-navy-accent-light border-b rounded-t justify-center h-[20px] bg-brand-navy text-brand-gray cursor-default z-20">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport
            style={{ maxHeight }}
            className="w-full overflow-hidden rounded bg-brand-navy-light"
          >
            {resolvedOptions.map(({ option, optionClassName, icon }) => {
              return (
                <SelectPrimitive.Item
                  value={option}
                  key={option}
                  disabled={isOptionDisabled(option)}
                  className={cn(
                    textVariantClassnames.p,
                    "whitespace-nowrap flex gap-3 justify-start items-center w-full p-1 border-2 border-transparent transition-all bg-brand-navy-light  data-[highlighted]:outline-none data-[highlighted]:bg-white/5 outline-none data-[disabled]:opacity-50 cursor-default",
                    viewportMatchTriggerWidth && "justify-center",
                    itemClassName,
                    isOptionDisabled(option) && "hidden",
                    optionClassName
                  )}
                >
                  <SelectPrimitive.ItemText>
                    {getOptionLabel(option)}
                  </SelectPrimitive.ItemText>
                  {icon && <Icon icon="crown" size={14} />}
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="absolute flex w-full items-center bottom-0 border-t-brand-navy-accent-light rounded-b border-t justify-center h-[20px] bg-brand-navy text-brand-gray cursor-default z-20">
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
