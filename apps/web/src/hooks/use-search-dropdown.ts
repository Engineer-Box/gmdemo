import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useOutsideClick } from "./use-outside-click";

// TODO: Add "onInputClick" and "onInputChange" to the return type

export const useSearchDropdown = <T>(
  queryKeyPrefix: string,
  queryFunction: (query: string) => Promise<T[]>
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shouldShowLoader, setShouldShowLoader] = useState(false);

  const { data, isLoading, isError, isPreviousData, isFetching } = useQuery(
    ["search-dropdown", queryKeyPrefix, query],
    () => queryFunction(query),
    {
      enabled: !!query.length && query.trim() !== "",
      staleTime: 1000 * 60,
      keepPreviousData: true,
    }
  );

  const { registerRefForOutsideClick } = useOutsideClick(() =>
    setIsOpen(false)
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if ((isPreviousData || isFetching) && query.length > 0) {
      setShouldShowLoader(true);
      timer = setTimeout(() => {
        setShouldShowLoader(false);
      }, 350);
    }

    return () => {
      if ((isPreviousData || isFetching) && shouldShowLoader) {
        clearTimeout(timer);
      }
    };
  }, [isPreviousData, isFetching, shouldShowLoader, query]);

  return {
    shouldShowDropdown: isOpen && query.length > 0,
    isFetchingResults: shouldShowLoader && !isLoading,
    isInitialising: isLoading,
    isNoResults: !!query.length && !shouldShowLoader && !data?.length,
    isError,
    results: data ?? [],
    setQuery,
    setIsOpen,
    registerRefForOutsideClick,
    query,
  } as const;
};
