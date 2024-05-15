import { strapiApi } from "@/lib/strapi";
import { StrapiEntity } from "@/types/strapi-types";

type Transaction = {
  confirmed: boolean;
  amount: number;
  type: "deposit" | "withdraw" | "in" | "out";
};

export class TransactionService {
  static async getPendingTransactionsForProfile(profileId: number) {
    const pendingTransactionsResponse = await strapiApi.find<
      StrapiEntity<Transaction>
    >("transactions", {
      filters: {
        profile: profileId,
        confirmed: false,
      },
    });

    const hasPendingTransactions = pendingTransactionsResponse.data.length > 0;

    const pendingBalance = pendingTransactionsResponse.data.reduce(
      (acc, transaction) => {
        const { type: transactionType, amount } = transaction.attributes;
        return transactionType === "deposit" ? acc + amount : acc; // the balance already treats withdrawals as real
      },
      0
    );

    return { hasPendingTransactions, pendingBalance } as const;
  }
  static async deposit(amount: number) {
    return strapiApi.request<undefined>("post", "/transactions/deposit", {
      data: {
        data: {
          amount,
        },
      },
    });
  }
  static async withdraw(amount: number) {
    return strapiApi.request<undefined>("post", "/transactions/withdraw", {
      data: {
        data: {
          amount,
        },
      },
    });
  }
}
