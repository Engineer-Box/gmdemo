import { strapiApi } from "@/lib/strapi";

export const cancelBattle = async (id: number) => {
  await strapiApi.request("GET", `/battles/cancel/${id}`, {});
};
