import { strapiApi } from "@/lib/strapi";
import { ProfileResponse, SocialLinksComponent } from "../types";
import { profilePopulate } from "./shared";

export const removeSocialLink = async (
  profileId: number,
  platform: keyof SocialLinksComponent
) => {
  const profileResponse = await strapiApi.update<ProfileResponse>(
    "profiles",
    profileId,
    {
      social_links: {
        [platform]: null,
      },
    },
    {
      populate: profilePopulate,
    }
  );

  return profileResponse.data;
};
