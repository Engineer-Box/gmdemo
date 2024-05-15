import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/button";
import { useEffect, useState } from "react";
import { getTeamProfileForUserBy } from "@/features/profile/util";
import { useToast } from "@/providers/toast-provider";
import { USER_QUERY_KEY } from "@/constants";
import { useRouter } from "next/router";
import { cancelBattle } from "../../service/cancel-battle";
import { GetBattleResponse, getBattle } from "../../service/get-battle";
import { Modal } from "@/components/modal/modal";
import { HomeOrAway } from "../../types";
import { withdrawCancellationRequest } from "../../service/withdraw-cancellation-request";

type CancelBattleButtonProps = {
  battle: GetBattleResponse;
  side: HomeOrAway;
};

export const CancelBattleButton = ({
  battle,
  side,
}: CancelBattleButtonProps) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const {
    mutate: withdrawCancellationRequestMutation,
    isLoading: withdrawCancellationRequestIsLoading,
  } = useMutation(() => withdrawCancellationRequest(battle.id!), {
    onSuccess() {
      addToast({ type: "success", message: "Request withdrawn" });
    },
    onError() {
      addToast({ type: "error", message: "Something went wrong" });
    },
    async onSettled() {
      await queryClient.refetchQueries({
        queryKey: getBattle.queryKey(battle.id),
      });

      setIsConfirmationModalOpen(false);
    },
  });
  const { mutate: requestCancel, isLoading: requestCancelIsLoading } =
    useMutation(
      (requestType: "request" | "confirm") => cancelBattle(battle?.id!),
      {
        onSuccess(data, variables) {
          if (variables === "confirm") {
            router.replace(
              `/battles/${battle?.attributes.match_options.game.data?.attributes.slug}`
            );
          }

          addToast({
            type: "success",
            message:
              variables === "request"
                ? "Cancellation requested"
                : "Battle has been cancelled",
          });
        },
        onError() {
          addToast({ type: "error", message: "Something went wrong" });
        },
        async onSettled() {
          await queryClient.refetchQueries({
            queryKey: getBattle.queryKey(battle.id),
          });
          queryClient.invalidateQueries(USER_QUERY_KEY);
          setIsConfirmationModalOpen(false);
        },
      }
    );

  const cancellationRequestedBy = battle?.attributes.cancellation_requested_by;
  const didAlreadyRequestCancellation = cancellationRequestedBy === side;
  const didOpponentRequestCancellation =
    cancellationRequestedBy !== null && cancellationRequestedBy !== side;

  const description = didAlreadyRequestCancellation
    ? "You are about to withdraw your cancellation request"
    : didOpponentRequestCancellation
      ? "Your opponent has requested to cancel the battle"
      : "You are about to request to cancel the battle";

  const buttonTitle = !cancellationRequestedBy
    ? "Request cancellation"
    : didAlreadyRequestCancellation
      ? "Withdraw request"
      : "Confirm cancellation";

  return (
    <div className="relative">
      <Modal
        isLoading={
          requestCancelIsLoading || withdrawCancellationRequestIsLoading
        }
        title="Are you sure?"
        isOpen={isConfirmationModalOpen}
        closeModal={() => setIsConfirmationModalOpen(false)}
        isClosable
        description={description}
        Footer={
          <div className="flex gap-3 justify-end">
            <Button
              variant={"secondary"}
              title={"Cancel"}
              onClick={() => setIsConfirmationModalOpen(false)}
            />
            <Button
              variant={"delete"}
              title={buttonTitle}
              onClick={() => {
                if (didAlreadyRequestCancellation) {
                  withdrawCancellationRequestMutation();
                } else {
                  requestCancel(
                    cancellationRequestedBy === null ? "request" : "confirm"
                  );
                }
              }}
            />
          </div>
        }
      />
      <Button
        variant={"delete"}
        title={buttonTitle}
        className="w-full"
        onClick={() => setIsConfirmationModalOpen(true)}
        disabled={requestCancelIsLoading}
      />
    </div>
  );
};
