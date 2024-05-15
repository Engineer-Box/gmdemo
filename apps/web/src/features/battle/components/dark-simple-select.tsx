import { SimpleSelect, SimpleSelectProps } from "@/components/simple-select";
import { cn } from "@/utils/cn";
import { Controller, ControllerProps } from "react-hook-form";

export const DarkSimpleSelect = ({
  control,
  name,
  defaultValue,
  options,
  placeholder,
  getOptionLabel,
}: Pick<SimpleSelectProps, "options" | "getOptionLabel" | "placeholder"> &
  Pick<
    ControllerProps<any>,
    "control" | "rules" | "defaultValue" | "name"
  >) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: true }}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <SimpleSelect
          placeholder={"Select option"}
          value={field.value}
          setValue={field.onChange}
          viewportMatchTriggerWidth
          maxHeight={165}
          options={options}
          triggerClassName={cn(
            "px-2.5 py-1 bg-brand-navy rounded text-white",
            "border border-solid border-transparent",
            fieldState.error && "border-brand-status-error"
          )}
          itemClassName="bg-brand-navy py-1 px-2.5 text-white"
          getOptionLabel={getOptionLabel}
        />
      )}
    />
  );
};
