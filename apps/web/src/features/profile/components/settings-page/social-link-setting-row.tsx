import { Text } from "@/components/text";
import { SocialLinkIcon } from "../social-link-icon";
import { toPascalCase } from "@/utils/to-pascal-case";
import { IconButton } from "@/components/icon-button";
import { SocialLinksComponent } from "../../types";

type SocialLinkSettingRowProps = {
  onRemoveClick: () => void;
  platform: keyof SocialLinksComponent;
  value: string;
};

export const SocialLinkSettingsRow = ({
  platform,
  onRemoveClick,
  value,
}: SocialLinkSettingRowProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="p-1">
        <SocialLinkIcon platform={platform} size={24} value={value} />
      </div>
      <Text variant="label" className="">
        {toPascalCase(platform)}
      </Text>
    </div>
    <IconButton
      icon="round-cross"
      onClick={onRemoveClick}
      className="text-brand-status-error hover:text-red-800"
    />
  </div>
);
