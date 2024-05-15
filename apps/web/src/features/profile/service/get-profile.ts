import { strapiApi } from "@/lib/strapi";
import { profilePopulate } from "./shared";
import { ProfileResponse } from "../types";

export const getProfile = async (id: number) => {
  const profileResponse = await strapiApi.findOne<ProfileResponse>(
    "profiles",
    id,
    {
      populate: profilePopulate,
    }
  );
  return profileResponse;
};
