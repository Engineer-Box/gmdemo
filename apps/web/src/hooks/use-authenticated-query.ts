import { useToken } from "@/providers/token-provider";
import { useCallback, useState } from "react";
import {
  QueryFunction,
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

// TODO: It makes sense to handle the error here as well

type UseQueryParams = Parameters<typeof useQuery>;

export const useAuthenticatedQuery = <TData, TError>(
  key: UseQueryParams[0],
  fetchFn: QueryFunction<TData, QueryKey>,
  options?: Omit<
    UseQueryOptions<TData, TError, TData, QueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TData, TError> => {
  const { isTokenLoading } = useToken();

  const query = useQuery<TData, TError>(key, fetchFn, {
    ...(options || {}),
    enabled: !isTokenLoading && !!options?.enabled,
  });

  return query;
};
