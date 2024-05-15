import { USER_QUERY_KEY } from "@/constants";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { useToast } from "@/providers/toast-provider";
import { StrapiError } from "@/utils/strapi-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useState } from "react";

const USER_ERRORS = [
  "GamerTagCannotBeEmpty",
  "GamerTagTakenForGame",
  "GamerTagRequiredIfInTeamForGame",
  "PendingResultsForGame",
] as const;

type UserError = (typeof USER_ERRORS)[number];

type tp = NonNullable<
  AuthenticatedUser["data"]["profile"]["gamer_tags"]["data"]
>;
export const useGamerTagMutation = <
  TMutationFn extends (args: any) => Promise<any>,
>(
  mutationFn: TMutationFn,
  {
    successMessage,
    onSuccess,
    closeModal,
    onUserError,
    getOptimisticGamerTags,
  }: {
    successMessage: string;
    closeModal: () => void;
    onUserError?: (error: UserError) => void;
    onSuccess?: () => void;
    getOptimisticGamerTags?: (
      variables: Parameters<TMutationFn>[0],
      gamerTagsInCache: NonNullable<
        AuthenticatedUser["data"]["profile"]["gamer_tags"]["data"]
      >
    ) => NonNullable<
      AuthenticatedUser["data"]["profile"]["gamer_tags"]["data"]
    >;
  }
) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [userError, setUserError] = useState<UserError | null>(null);
  const {
    mutate,
    isLoading,
    reset: resetMutation,
  } = useMutation(mutationFn, {
    onMutate(variables) {
      const previousData =
        queryClient.getQueryData<AuthenticatedUser>(USER_QUERY_KEY);

      const hasCachedProfile = previousData?.data?.profile;

      if (!hasCachedProfile || !getOptimisticGamerTags) return;

      const previousGamerTags =
        previousData?.data?.profile?.gamer_tags?.data ?? [];

      const optimisticGamerTags = getOptimisticGamerTags?.(
        variables,
        previousGamerTags
      );

      const optimisticProfile = produce(previousData, (draft) => {
        draft!.data.profile.gamer_tags.data = optimisticGamerTags;
        return draft;
      });

      queryClient.setQueryData(USER_QUERY_KEY, optimisticProfile);

      return { previousData };
    },
    onError(error, variables, context) {
      if (getOptimisticGamerTags) {
        const previousData = context?.previousData;
        if (previousData) {
          queryClient.setQueryData(USER_QUERY_KEY, previousData);
        }
      }
      const strapiError = StrapiError.isStrapiError(error);

      const isUserError =
        strapiError && USER_ERRORS.includes(error.error.message as UserError);

      if (isUserError) {
        setUserError(error.error.message as UserError);
        onUserError?.(error.error.message as UserError);
      } else {
        closeModal();
        addToast({
          message: "Something went wrong",
          type: "error",
        });
      }
    },
    onSettled() {
      queryClient.invalidateQueries(USER_QUERY_KEY);
    },
    onSuccess() {
      addToast({
        message: successMessage,
        type: "success",
      });

      onSuccess?.();
      closeModal();
    },
  });

  const reset = () => {
    setUserError(null);
    resetMutation();
  };
  return {
    mutate,
    userError,
    isLoading,
    reset,
  } as const;
};
