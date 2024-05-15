import { strapiApi } from "@/lib/strapi";

export const toggleVouch = async (profileId: number) => {
  await strapiApi.request("GET", `/profiles/vouch/${profileId}`, {});
};
