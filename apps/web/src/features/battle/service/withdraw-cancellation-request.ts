import { strapiApi } from "@/lib/strapi";

export const withdrawCancellationRequest = async (battleId: number) => {
  await strapiApi.request(
    "GET",
    `/battles/withdraw-cancellation-request/${battleId}`,
    {}
  );
};
