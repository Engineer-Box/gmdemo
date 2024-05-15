import { strapiApi } from "@/lib/strapi";
import { ProfileResponse, SocialLinksComponent } from "../types";
import { profilePopulate } from "./shared";

export const addSocialLink = async (
  profileId: number,
  platform: keyof SocialLinksComponent,
  value: string
) => {
  const profileResponse = await strapiApi.update<ProfileResponse>(
    "profiles",
    profileId,
    {
      social_links: {
        [platform]: value,
      },
    },
    {
      populate: profilePopulate,
    }
  );

  return profileResponse.data;
};
