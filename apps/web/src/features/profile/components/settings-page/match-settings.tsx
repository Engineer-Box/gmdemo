import { Heading } from "@/components/heading";
import Switch from "@/components/switch";
import { Text } from "@/components/text";
import { useToast } from "@/providers/toast-provider";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { produce } from "immer";
import { useEffect } from "react";
import { USER_QUERY_KEY } from "@/constants";
import { Separator } from "@/components/separator";
import { updateProfile } from "../../service/update-profile";

type MatchSettingsProps = {
  profileId: number;
  wagerMode: boolean;
  trustMode: boolean;
};

export const MatchSettings = ({
  profileId,
  trustMode,
  wagerMode,
}: MatchSettingsProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { mutate, isError, reset } = useMutation(updateProfile, {
    async onMutate(variables) {
      await queryClient.cancelQueries(USER_QUERY_KEY);
      const previousUser = queryClient.getQueryData(
        USER_QUERY_KEY
      ) as AuthenticatedUser;

      if (!previousUser) {
        throw new Error("User not found in cache");
      }

      const newUser = produce(previousUser, (draft) => {
        if (variables.wager_mode !== undefined) {
          draft.data!.profile.wager_mode = variables.wager_mode;
        }
        if (variables.trust_mode !== undefined) {
          draft.data!.profile.trust_mode = variables.trust_mode;
        }
      });

      queryClient.setQueryData(USER_QUERY_KEY, newUser);

      return { previousUser };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(USER_QUERY_KEY, context!.previousUser);
    },
    onSuccess() {
      addToast({
        type: "success",
        message: "Settings updated",
      });
    },
    onSettled() {
      queryClient.invalidateQueries(USER_QUERY_KEY);
    },
  });

  useEffect(() => {
    if (isError) {
      addToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });

      reset();
    }
  }, [isError]);

  const setMode = (mode: "trust" | "wager", value: boolean) => {
    mutate({
      profileId,
      ...(mode === "trust" ? { trust_mode: value } : { wager_mode: value }),
    });
  };

  return (
    <div>
      <Heading variant="h3">Match settings</Heading>
      <div className="flex items-center justify-between gap-8">
        <div>
          <Text variant="label" className="mb-1">
            Wager mode
          </Text>
          <Text variant="p">
            Enabling this setting confirms that you know the risks that apply
            when wagering your crypo against other teams and players.
          </Text>
        </div>
        <div className="grow">
          <Switch value={wagerMode} setValue={(v) => setMode("wager", v)} />
        </div>
      </div>

      <Separator className=" data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />

      <div className="flex items-center justify-between gap-8">
        <div>
          <Text variant="label" className="mb-1">
            Automatically allow team leaders to create and accept wager matches
          </Text>
          <Text variant="p">
            Allow leaders and co-leaders of any team you join to have the
            ability to place you in wager matches without your permission. It is
            important that you trust the members of your team before joining
            when this is enabled.
          </Text>
        </div>
        <div className="grow">
          <Switch value={trustMode} setValue={(v) => setMode("trust", v)} />
        </div>
      </div>
    </div>
  );
};
