import * as SelectPrimitive from "@radix-ui/react-select";
import { useRef } from "react";
import { InputLayout } from "./input-layout";
import { cn } from "@/utils/cn";
import { Text, textVariantClassnames } from "./text";
import { Icon, IconType } from "./icon";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

export type SelectProps = {
  options: string[];
  icon?: IconType;
  value: string | null;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
  placeholder?: string;
  error?: string | boolean;
  disabled?: boolean;
  getLabel?: (id: string) => string;
  disabledOptions?: string[];
  triggerClassName?: string;
  autoHeight?: boolean;
};

export const Select = ({
  options,
  value,
  setValue,
  icon,
  placeholder,
  disabled,
  getLabel = (value) => value,
  error,
  disabledOptions = [],
  autoHeight,
  triggerClassName,
}: SelectProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isOptionDisabled = (option: string) => disabledOptions.includes(option);

  return (
    <SelectPrimitive.Root
      disabled={disabled}
      value={value ?? undefined}
      onValueChange={(v) => {
        setValue(v);
      }}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "w-full outline-none focus:outline-none",
          triggerClassName
        )}
        onFocus={() => {
          ref.current?.focus();
        }}
        onBlur={() => {
          ref.current?.blur();
        }}
        asChild
      >
        <InputLayout
          icon={icon}
          error={error}
          ref={ref}
          tabIndex={-1}
          disabled={disabled}
          autoHeight={autoHeight}
        >
          <div className="flex items-center justify-between h-full gap-4">
            <Text
              className={cn({ "text-brand-white whitespace-nowrap": !!value })}
            >
              {(value && getLabel(value)) ?? placeholder ?? "Choose an option"}
            </Text>

            <Icon icon="chevron-down" size={12} />
          </div>
        </InputLayout>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="w-[var(--radix-select-trigger-width)] z-50"
          position="popper"
          sideOffset={8}
          side="bottom"
        >
          <SelectPrimitive.ScrollUpButton className="absolute flex w-full items-center border-b-brand-navy-accent-light border-b rounded-t justify-center h-[30px] bg-brand-navy text-brand-gray cursor-default z-20">
            <ChevronUpIcon />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="w-full h-full overflow-hidden rounded bg-brand-navy max-h-56">
            {options.length > 0 ? (
              options.map((option) => (
                <SelectPrimitive.Item
                  disabled={isOptionDisabled(option)}
                  value={option}
                  key={option}
                  className={cn(
                    textVariantClassnames.p,
                    "w-full gap-12 px-4 py-2 border-2 border-transparent transition-all bg-brand-navy  data-[highlighted]:outline-none data-[highlighted]:bg-whiteAlpha-50 outline-none text-brand-white data-[disabled]:opacity-70"
                  )}
                >
                  <SelectPrimitive.ItemText>
                    {getLabel(option)}
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))
            ) : (
              <SelectPrimitive.Item
                disabled={true}
                value={"no-option-selected"}
                className={cn(
                  textVariantClassnames.p,
                  "w-full gap-12 px-4 py-2 border-2 border-transparent transition-all bg-brand-navy  data-[highlighted]:outline-none data-[highlighted]:bg-whiteAlpha-50 outline-none text-brand-white data-[disabled]:opacity-70"
                )}
              >
                <SelectPrimitive.ItemText>No options</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            )}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="absolute flex w-full items-center bottom-0 border-t-brand-navy-accent-light rounded-b border-t justify-center h-[30px] bg-brand-navy text-brand-gray cursor-default z-20">
            <ChevronDownIcon />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
