import { useIsFetching, useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { TransactionService } from "@/features/transaction/transaction-service";
import { useEffect, useMemo } from "react";
import { USER_QUERY_KEY } from "@/constants";

export const usePendingBalance = () => {
  const { user, isUserLoading } = useAuth();
  const balance = user?.data.profile.balance ?? 0;
  const isFetching = useIsFetching(USER_QUERY_KEY);
  const userId = user?.data.profile.id;
  const {
    data: pendingBalanceData,
    refetch: refetchPendingBalance,
    isLoading: pendingBalanceIsLoading,
  } = useQuery(
    ["pendingBalance", userId],
    () => TransactionService.getPendingTransactionsForProfile(userId!),
    {
      enabled: !!userId,
    }
  );
  useEffect(() => {
    if (!isFetching) {
      refetchPendingBalance();
    }
  }, [isFetching]);

  const pendingBalance = useMemo(
    () =>
      balance +
      (pendingBalanceData?.hasPendingTransactions
        ? pendingBalanceData.pendingBalance
        : 0),
    [balance, pendingBalanceData]
  );

  return {
    balance: pendingBalance,
    isBalanceLoading: pendingBalanceIsLoading || isUserLoading,
    hasPendingBalance: pendingBalanceData?.hasPendingTransactions,
  } as const;
};
