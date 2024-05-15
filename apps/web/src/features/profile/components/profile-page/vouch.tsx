import { Text } from "@/components/text";
import { AuthenticatedUser, useAuth } from "@/hooks/use-auth";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { USER_QUERY_KEY } from "@/constants";
import { Button } from "@/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons";
import { produce } from "immer";
import { toggleVouch } from "../../service/toggle-vouch";
import { ProfileResponse } from "../../types";
import {
  GetProfileWithVouchAndLeaderboardItemStatsResponse,
  getProfileWithVouchAndLeaderboardItemStats,
} from "../../service/get-profile-with-vouch-and-leaderboard-stats";

type VouchProps = {
  profileIdToVouch: number;
  vouchCount: number;
  currentUser?: AuthenticatedUser;
};

export const Vouch = ({
  profileIdToVouch,
  vouchCount,
  currentUser,
}: VouchProps) => {
  const queryClient = useQueryClient();
  const didVouch = !!currentUser?.data.profile.vouched_for?.data?.find(
    (profileVouchedFor) => profileVouchedFor.id === profileIdToVouch
  );
  const { mutate: toggleVouchMutation, isLoading } = useOptimisticMutation<
    AuthenticatedUser,
    () => any
  >(() => toggleVouch(profileIdToVouch), {
    queryKey: USER_QUERY_KEY,
    onMutate() {
      const queryKey =
        getProfileWithVouchAndLeaderboardItemStats.queryKey(profileIdToVouch);
      const initialProfile =
        queryClient.getQueryData<GetProfileWithVouchAndLeaderboardItemStatsResponse>(
          queryKey
        );

      const optimisticProfile = produce(initialProfile, (draft) => {
        if (draft && typeof draft?.data.attributes.vouch_count === "number") {
          draft.data.attributes.vouch_count += didVouch ? -1 : 1;
        }

        return draft;
      });

      queryClient.setQueryData(queryKey, optimisticProfile);
    },
    onSettled() {
      queryClient.invalidateQueries(["profile", profileIdToVouch]);
    },
    updateCache(_, previousValueDraft) {
      const newVouchedForProfile = {
        id: profileIdToVouch,
        attributes: {},
      } as any;
      if (didVouch) {
        // if they have already vouched then we should optimistically unvouch
        // this is a bit hacky but its fine given it will refresh after the request is complete
        previousValueDraft!.data.profile.vouched_for = { data: [] };
      } else {
        if (previousValueDraft!.data.profile.vouched_for?.data) {
          previousValueDraft?.data.profile.vouched_for.data.push(
            newVouchedForProfile
          );
        } else {
          previousValueDraft!.data.profile.vouched_for = {
            data: [newVouchedForProfile],
          };
        }
      }
      return previousValueDraft;
    },
  });
  return (
    <div className="flex gap-2 items-center">
      <Button
        size={"sm"}
        disabled={!currentUser?.data.profile.id || isLoading}
        onClick={() => toggleVouchMutation(undefined)}
      >
        <div className="flex gap-1.5 items-center">
          {didVouch ? (
            <HeartFilledIcon width={16} height={16} />
          ) : (
            <HeartIcon width={16} height={16} />
          )}
          Vouch
        </div>
      </Button>
      <Text variant="p">{vouchCount}</Text>
    </div>
  );
};
