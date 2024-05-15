import { strapiApi, StrapiResponse } from "@/lib/strapi";
import { ProfileResponse } from "../types";
import { profilePopulate } from "./shared";

export const getProfileByWalletAddress = async (address: string) => {
  const profile = await strapiApi.request<StrapiResponse<ProfileResponse>>(
    "GET",
    `/profiles/by-wallet-address/${address}`,
    {
      params: {
        populate: profilePopulate,
      },
    }
  );
  return profile.data;
};
