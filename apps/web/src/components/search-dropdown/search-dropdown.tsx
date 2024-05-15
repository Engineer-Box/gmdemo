import { useSearchDropdown } from "@/hooks/use-search-dropdown";
import { ReactNode, useRef, useState } from "react";
import { InputLayout } from "../input-layout";
import { cn } from "@/utils/cn";

type SearchDropdownProps<T extends {}> = {
  renderItem: (result: T) => ReactNode;
  placeholder?: string;
  ItemSkeleton: ReactNode;
  inputClassName?: string;
  disabled?: boolean;
  dropdownContainerClassName?: string;
  NoItemsFound: ReactNode;
  onResultClick: (result: T) => void;
} & ReturnType<typeof useSearchDropdown<T>>;

export const SearchDropdown = <T extends {}>({
  placeholder,
  setIsOpen,
  setQuery,
  query,
  onResultClick,
  shouldShowDropdown,
  renderItem,
  ItemSkeleton,
  dropdownContainerClassName,
  inputClassName,
  isFetchingResults,
  isInitialising,
  isNoResults,
  isError,
  disabled,
  results,
  NoItemsFound,
  registerRefForOutsideClick,
}: SearchDropdownProps<T>) => {
  const focusRefs = useRef<any[]>([]);
  const [cursor, setCursor] = useState(0);

  // useEffect(() => {
  //   const elementToFocus = focusRefs.current[cursor];

  //   if (elementToFocus?.focus && false) {
  //     elementToFocus.focus();
  //   }
  // }, [cursor]);

  // useKeyPress(
  //   (key) => {
  //     const maxCursor = data?.length ?? 0;
  //     if (key === "ArrowDown") {
  //       setCursor((prev) => (prev >= maxCursor ? 0 : prev + 1));
  //     }
  //     if (key === "ArrowUp") {
  //       setCursor((prev) => (prev <= 0 ? maxCursor : prev - 1));
  //     }
  //   },
  //   [data?.length]
  // );

  return (
    <div
      className="relative z-0 w-full h-full"
      ref={registerRefForOutsideClick()}
    >
      <InputLayout
        icon="search"
        className={cn("w-full h-full bg-brand-navy-light", inputClassName)}
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <input
          disabled={disabled}
          type="text"
          ref={(node) => (focusRefs.current[0] = node)}
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-full bg-transparent outline-none focus:outline-none text-brand-white"
        />
      </InputLayout>

      {!disabled && shouldShowDropdown && (
        <div
          className={cn(
            "absolute z-20 w-full mt-3 scroll-light rounded top-full bg-brand-navy-light overflow-y-auto max-h-56",
            dropdownContainerClassName
          )}
        >
          {isFetchingResults && (
            <div className="w-full p-2">{ItemSkeleton}</div>
          )}
          {results.map((searchResult, i) => (
            <div
              onClick={() => {
                onResultClick(searchResult);
                setIsOpen(false);
              }}
              className="w-full p-2 transition cursor-pointer hover:bg-brand-navy-light-accent-light"
              key={i}
            >
              {renderItem(searchResult)}
            </div>
          ))}
          {isInitialising && (
            <>
              <div className="w-full p-2">{ItemSkeleton}</div>
              <div className="w-full p-2">{ItemSkeleton}</div>
              <div className="w-full p-2">{ItemSkeleton}</div>
              <div className="w-full p-2">{ItemSkeleton}</div>
            </>
          )}

          {isNoResults && <div className="w-full p-2">{NoItemsFound}</div>}
        </div>
      )}
    </div>
  );
};
