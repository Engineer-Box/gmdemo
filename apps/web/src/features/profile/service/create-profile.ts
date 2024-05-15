import { strapiApi } from "@/lib/strapi";
import { StrapiEntity } from "@/types/strapi-types";

export const createProfile = async (address: string) => {
  const profileResponse = await strapiApi.create<StrapiEntity<{}>>("profiles", {
    wallet_address: address,
  });

  return profileResponse.data.id;
};
