import { useState } from "react";
import { Button } from "@/components/button";
import { AddSocialLinkModal } from "./add-social-link-modal";
import { SubSettingLayout } from "./sub-setting-layout";
import { Icon } from "@/components/icon";
import { SocialLinkIcon } from "../social-link-icon";
import { Text } from "@/components/text";
import { toPascalCase } from "@/utils/to-pascal-case";
import { SocialLinkSettingsRow } from "./social-link-setting-row";
import { RemoveSocialLinkModal } from "./remove-social-link-modal";
import { Profile, SocialLinksComponent } from "../../types";

type SocialLinkSettingsProps = {
  socialLinks: Profile["social_links"];
  profileId: number;
};

export const SocialLinkSettings = ({
  socialLinks,
  profileId,
}: SocialLinkSettingsProps) => {
  const [isAddSocialLinkModalOpen, setIsAddSocialLinkModalOpen] =
    useState(false);

  const [socialPlatformToRemove, setSocialPlatformToRemove] = useState<
    keyof SocialLinksComponent | null
  >(null);

  const discord = socialLinks?.discord;
  const twitter = socialLinks?.twitter;
  const youtube = socialLinks?.youtube;
  const twitch = socialLinks?.twitch;

  return (
    <div>
      <RemoveSocialLinkModal
        profileId={profileId}
        platformToRemove={socialPlatformToRemove}
        closeModal={() => setSocialPlatformToRemove(null)}
      />
      {isAddSocialLinkModalOpen && (
        <AddSocialLinkModal
          isOpen={isAddSocialLinkModalOpen}
          closeModal={() => setIsAddSocialLinkModalOpen(false)}
          profileId={profileId}
          socialLinks={socialLinks}
        />
      )}

      <SubSettingLayout
        title="Social links"
        onClick={() => setIsAddSocialLinkModalOpen(true)}
      >
        {discord && (
          <SocialLinkSettingsRow
            platform="discord"
            value={discord}
            onRemoveClick={() => setSocialPlatformToRemove("discord")}
          />
        )}
        {twitter && (
          <SocialLinkSettingsRow
            platform="twitter"
            value={twitter}
            onRemoveClick={() => setSocialPlatformToRemove("twitter")}
          />
        )}
        {youtube && (
          <SocialLinkSettingsRow
            platform="youtube"
            value={youtube}
            onRemoveClick={() => setSocialPlatformToRemove("youtube")}
          />
        )}
        {twitch && (
          <SocialLinkSettingsRow
            platform="twitch"
            value={twitch}
            onRemoveClick={() => setSocialPlatformToRemove("twitch")}
          />
        )}
      </SubSettingLayout>
    </div>
  );
};
