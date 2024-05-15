import { Icon } from "@/components/icon";
import { SocialLinksComponent } from "../../types";
import { Clickable } from "@/components/clickable";

type ProfileLinksProps = {
  links: SocialLinksComponent;
};

const socialLinkBuilder = {
  discord: (userId: string) => `https://discord.com/users/${userId}`,
  youtube: (handle: string) => `https://youtube.com/@${handle}`,
  twitter: (handle: string) => `https://twitter.com/${handle}`,
  twitch: (channel: string) => `https://twitch.tv/${channel}`,
} as const;

const SocialLinkIcon = ({
  platform,
  link,
}: {
  platform: keyof SocialLinksComponent;
  link: string | null;
}) =>
  link ? (
    <Clickable
      action={{ href: socialLinkBuilder[platform](link), isExternal: true }}
    >
      <Icon className="text-brand-gray" size={25} icon={platform} />
    </Clickable>
  ) : null;

export const ProfileLinks = ({ links }: ProfileLinksProps) => {
  return (
    <div className="flex items-center gap-5">
      <SocialLinkIcon platform="discord" link={links?.discord} />
      <SocialLinkIcon platform="twitter" link={links?.twitter} />
      <SocialLinkIcon platform="youtube" link={links?.youtube} />
      <SocialLinkIcon platform="twitch" link={links?.twitch} />
    </div>
  );
};
