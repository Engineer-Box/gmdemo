import { cn } from "@/utils/cn";
import { Text, textVariantClassnames } from "./text";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { TriangleUpIcon, TriangleDownIcon } from "@radix-ui/react-icons";
import { getCentsFromStringValue } from "@/features/battle/util";

type DollarInputProps = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  error?: boolean;
  maxValue?: number;
  variant?: "large" | "small";
  stepInCents?: number;
};

export const useDollarInput = () => {
  const [value, setValue] = useState("0.00");
  const amountInCents = useMemo(() => getCentsFromStringValue(value), [value]);

  return { value, setValue, amountInCents };
};

export const DollarInput = ({
  value,
  setValue,
  error,
  variant,
  maxValue,
  stepInCents = 100,
}: DollarInputProps) => {
  return (
    <div
      className={cn(
        "group inline-flex p-[1px] bg-brand-navy rounded overflow-hidden border border-solid border-brand-navy transition w-full",
        error && "border-brand-status-error"
      )}
    >
      <div>
        <Text
          className={cn(
            "py-2 px-2.5 font-medium bg-brand-navy-accent-light rounded-l h-full",
            variant === "small" && "py-1"
          )}
        >
          $
        </Text>
      </div>

      <input
        type="text"
        value={value}
        className={cn(
          textVariantClassnames.p,
          "bg-transparent outline-none text-emerald-400 px-2.5 w-full flex-grow"
        )}
        onBlur={() => {
          setValue((p) => {
            const dollars = Math.round(parseFloat(p) * 100) / 100;
            return Number.isNaN(dollars) ? "0.00" : dollars.toFixed(2);
          });
        }}
        onChange={(e) => {
          const inputValue = e.target.value;
          const regex = /^\d*(\.\d*)?$/;
          if (regex.test(inputValue) || inputValue === ".") {
            setValue(inputValue);
          }
        }}
      />
      <div>
        <div
          className={cn(
            "opacity-0 text-brand-gray-dark group-focus-within:opacity-100 group-hover:opacity-100 font-medium overflow-hidden rounded-r flex flex-col justify-center w-full transition"
          )}
        >
          <button
            className="cursor-pointer pr-1.5 hover:text-brand-white"
            onClick={() => {
              setValue((p) => {
                const cents = getCentsFromStringValue(p);
                const newValue = cents + stepInCents;

                if (maxValue && newValue > maxValue * 100)
                  return `${maxValue}.00`;

                return (newValue / 100).toFixed(2);
              });
            }}
          >
            <TriangleUpIcon color="currentColor" width={16} height={16} />
          </button>
          <button
            className="cursor-pointer pr-1.5 hover:text-brand-white"
            onClick={() => {
              setValue((p) => {
                const cents = getCentsFromStringValue(p);
                const newValue = cents - stepInCents;

                if (newValue < 0) return "0.00";

                return (newValue / 100).toFixed(2);
              });
            }}
          >
            <TriangleDownIcon color="currentColor" width={16} height={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
