import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { BasicToast, useToast } from "@/providers/toast-provider";
import { Text, textVariantClassnames } from "@/components/text";
import { Modal } from "@/components/modal/modal";
import { Button } from "@/components/button";
import { USDC_CONTRACT } from "../contracts/usdc-contract";
import { useAuth } from "@/hooks/use-auth";
import { GAMERLY_CONTRACT } from "../contracts/gamerly-contract";
import { TransactionService } from "../transaction-service";
import { StrapiError } from "@/utils/strapi-error";
import { toUsdString } from "@/utils/to-usd-string";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "@/constants";
import { DollarInput, useDollarInput } from "@/components/dollar-input";

type TransactionModalProps = {
  isOpen: boolean;
  closeModal: () => void;
};

export const TransactionModal = ({
  isOpen,
  closeModal,
}: TransactionModalProps) => {
  const [isWithdraw, setIsWithdraw] = useState(false);
  const { amountInCents, ...dollarInputProps } = useDollarInput();
  const queryClient = useQueryClient();
  const [isPendingTransactionModalOpen, setIsPendingTransactionModalOpen] =
    useState(false);
  const { contract: usdcContract } = useContract(
    USDC_CONTRACT.address,
    USDC_CONTRACT.abi
  );
  const { addToast } = useToast();
  const { user } = useAuth();
  const gamerlyBalance = user?.data.profile.balance ?? 0;
  const address = useAddress();
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: usdcBalanceOfData,
    isError: usdcBalanceOfIsError,
    isLoading: usdcBalanceOfIsLoading,
  } = useContractRead(usdcContract, "balanceOf", [address]);

  const usdcBalance = useMemo(() => {
    if (usdcBalanceOfIsLoading) {
      return 0;
    }

    if (usdcBalanceOfData?._isBigNumber) {
      const { _hex } = usdcBalanceOfData;
      return parseInt(_hex, 16) / Math.pow(10, 4);
    }
  }, [usdcBalanceOfData, usdcBalanceOfIsLoading, usdcBalanceOfIsError]);

  const availableBalance = isWithdraw ? gamerlyBalance : usdcBalance;

  useEffect(() => {
    dollarInputProps.setValue("0.00");
  }, [isWithdraw]);

  useEffect(() => {
    dollarInputProps.setValue("0.00");
    setIsWithdraw(false);
  }, [isOpen]);

  // TODO: Make deposit and withdraw a mutation
  const onConfirm = async () => {
    try {
      setIsLoading(true);
      const isDeposit = !isWithdraw;

      if (isDeposit) {
        const { receipt } = await usdcContract?.call("approve", [
          GAMERLY_CONTRACT.address,
          amountInCents * Math.pow(10, 4),
        ]);

        const txHash = receipt?.transactionHash;
        if (!txHash) {
          throw new Error("AllowanceFailed");
        }
        await TransactionService.deposit(amountInCents);
      } else {
        await TransactionService.withdraw(amountInCents);
      }
      setIsPendingTransactionModalOpen(true);
      queryClient.invalidateQueries(USER_QUERY_KEY);
    } catch (error) {
      let toastMessage = "Something went wrong";
      let toastType: BasicToast["type"] = "error";

      if (StrapiError.isStrapiError(error)) {
        const errorMessage = error.error.message;

        if (errorMessage === "AlreadyPendingTransaction") {
          toastMessage = "You already have a pending transaction";
        }

        if (errorMessage === "InvalidAmount") {
          toastMessage = "Amount must be an integer greater than 0";
        }
        if (errorMessage === "WithdrawalLimitExceeded") {
          toastMessage = "Withdrawal limit of $500 per day exceeded";
        }
      } else {
        if ((error as any)?.reason.includes("rejected")) {
          toastMessage = "Rejected the request.";
          toastType = "warning";
        }
      }

      addToast({
        type: toastType,
        message: toastMessage,
      });
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Modal
        closeModal={() => {
          closeModal();
          setIsPendingTransactionModalOpen(false);
        }}
        isOpen={isPendingTransactionModalOpen}
        isClosable
        title="Processing..."
        description="We are processing your transaction, please note that it may take up to 3 minutes for us to confirm. You will be notified when it is complete. "
        Footer={
          <div className="flex justify-end">
            <Button
              title="Close"
              variant="primary"
              onClick={() => {
                closeModal();
                setIsPendingTransactionModalOpen(false);
              }}
            />
          </div>
        }
      />
      <Modal
        isLoading={isLoading}
        title={isWithdraw ? "Withdraw" : "Deposit"}
        description="Deposit USDC into Gamerly and withdraw anytime."
        isOpen={isOpen}
        isClosable
        closeModal={closeModal}
        Top={
          <div className="inline-flex border mb-3 border-solid border-brand-navy-light-accent-light rounded overflow-hidden p-[4px] items-center bg-brand-navy -ml-1">
            <Text
              onClick={() => setIsWithdraw(false)}
              className={cn(
                "px-5 cursor-pointer text-brand-white py-2 transition rounded",
                !isWithdraw && "bg-brand-navy-accent-light"
              )}
            >
              Deposit
            </Text>

            <Text
              onClick={() => setIsWithdraw(true)}
              className={cn(
                "px-5 cursor-pointer text-brand-white py-2 transition rounded",
                isWithdraw && "bg-brand-navy-accent-light"
              )}
            >
              Withdraw
            </Text>
          </div>
        }
        Footer={
          <div className="flex items-center justify-end gap-3">
            <Button title="Cancel" variant={"secondary"} onClick={closeModal} />
            <Button
              title="Confirm"
              variant={"primary"}
              disabled={
                amountInCents < 101 ||
                (typeof availableBalance === "number" &&
                  amountInCents > availableBalance)
              }
              onClick={onConfirm}
            />
          </div>
        }
      >
        <div className="flex items-end gap-2">
          <div className="w-36">
            <DollarInput {...dollarInputProps} />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-gray-dark">
              {toUsdString(availableBalance ?? 0)} Available
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
