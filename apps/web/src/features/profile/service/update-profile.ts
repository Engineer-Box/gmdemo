import { strapiApi } from "@/lib/strapi";
import { ProfileRegions, ProfileResponse } from "../types";
import { profilePopulate } from "./shared";

type UpdateProfileProps = {
  profileId: number;
  username?: string;
  region?: ProfileRegions;
  wager_mode?: boolean;
  avatar?: number;
  bio?: string;
  trust_mode?: boolean;
};

export const updateProfile = async ({
  profileId,
  ...updateProps
}: UpdateProfileProps) => {
  const profileResponse = await strapiApi.update<ProfileResponse>(
    "profiles",
    profileId,
    updateProps,
    {
      populate: profilePopulate,
    }
  );

  return profileResponse.data;
};
