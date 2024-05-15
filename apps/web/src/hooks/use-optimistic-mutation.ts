import {
  MutationOptions,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Draft, produce } from "immer";

// TODO: start saving the route and navigating back on error

export const useOptimisticMutation = <
  TCache,
  TMutationFn extends (args: any) => Promise<any>,
  TVariables extends Parameters<TMutationFn>[0] = Parameters<TMutationFn>[0],
  TData = ReturnType<Awaited<TMutationFn>>,
  TContext extends { previousCacheValue: TCache } = {
    previousCacheValue: TCache;
  },
>(
  fn: TMutationFn,
  {
    queryKey,
    updateCache,
    onError,
    onNotFoundInCache,
    onSuccess,
    onSettled,
    onMutate,
  }: Omit<
    MutationOptions<TData, unknown, TVariables, TContext>,
    "mutationKey" | "onMutate" | "onSettled"
  > & {
    queryKey: QueryKey;
    onNotFoundInCache?: () => void;
    onMutate?: (variables: TVariables) => void;
    onSettled?: () => void;
    updateCache: (
      variables: TVariables,
      previousValueDraft?: Draft<TCache>
    ) => TCache | undefined;
  }
) => {
  const client = useQueryClient();
  const mutation = useMutation<TData, unknown, TVariables, any>(fn, {
    onMutate: async (variables) => {
      await client.cancelQueries(queryKey);
      const previousCacheValue = client.getQueryData<TCache>(queryKey);

      if (!previousCacheValue) {
        onNotFoundInCache?.();
      }

      const updatedValue = produce(previousCacheValue, (draft) => {
        updateCache(variables, draft);
      });

      client.setQueryData<TCache>(queryKey, updatedValue);

      onMutate?.(variables);
      return { previousCacheValue };
    },
    onError: (err, variables, context) => {
      client.setQueryData<TCache>(queryKey, context.previousCacheValue);
      onError?.(err, variables, context);
    },
    onSuccess: (data, variables, context) => {
      onSuccess?.(data, variables, context);
    },
    onSettled: () => {
      client.invalidateQueries(queryKey);
      onSettled?.();
    },
  });

  return mutation;
};
