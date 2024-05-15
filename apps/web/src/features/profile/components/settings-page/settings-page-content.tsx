import { Heading } from "@/components/heading";
import { MatchSettings } from "./match-settings";
import { AuthenticatedUser } from "@/hooks/use-auth";
import { GamerTagSettings } from "@/features/gamer-tag/components/gamer-tag-settings";
import { SocialLinkSettings } from "./social-link-settings";

export const SettingsPageContent = ({ user }: { user: AuthenticatedUser }) => {
  return (
    <div>
      <Heading variant="h1">Settings</Heading>
      <div className="grid md:grid-cols-7 gap-4 items-start">
        <div className="p-4 rounded bg-brand-navy-light md:col-span-7 col-span-1">
          <MatchSettings
            profileId={user.data.profile.id}
            wagerMode={user.data.profile.wager_mode}
            trustMode={user.data.profile.trust_mode}
          />
        </div>

        <div className="p-4 rounded bg-brand-navy-light md:col-span-4">
          <GamerTagSettings gamerTags={user.data.profile.gamer_tags} />
        </div>
        <div className="p-4 rounded bg-brand-navy-light md:col-span-3">
          <SocialLinkSettings
            socialLinks={user.data.profile.social_links}
            profileId={user.data.profile.id}
          />
        </div>
      </div>
    </div>
  );
};
