import Link from "next/link";
import { Icon } from "@/components/icon";
import { SocialLinksComponent } from "../types";

type SocialLinkIconProps = {
  size: number;
  platform: keyof SocialLinksComponent;
  value: string | null;
};

const LINK_PREFIXES: Record<keyof SocialLinksComponent, string> = {
  discord: "https://discord.com/users",
  twitter: "https://twitter.com",
  youtube: "https://www.youtube.com/@",
  twitch: "https://www.twitch.tv",
};
export const SocialLinkIcon = ({
  size,
  platform,
  value,
}: SocialLinkIconProps) => {
  if (!value) {
    return null;
  }

  return (
    <Link
      className="cursor-pointer"
      href={`${LINK_PREFIXES[platform]}/${value}`}
      target="_blank"
    >
      <Icon icon={platform} size={size} className={"text-brand-gray"} />
    </Link>
  );
};
