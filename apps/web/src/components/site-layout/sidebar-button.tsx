import { cn } from "@/utils/cn";
import { Icon, IconType, isIconType } from "../icon";
import { Text } from "../text";
import { Clickable, ClickableProps } from "../clickable";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";
import { Image } from "../image";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { ReactNode } from "react";

export type SidebarButtonProps = {
  label: string;
  icon: IconType | ReactNode | StrapiRelation<StrapiEntity<StrapiImage>>;
  isActive?: boolean;
  buttonClassName?: string;
  textClassName?: string;
  disabled?: boolean;
  action: ClickableProps["action"];
};

export const SidebarButton = ({
  label,
  icon,
  isActive,
  buttonClassName,
  textClassName,
  action,
}: SidebarButtonProps) => {
  return (
    <Clickable action={action}>
      <div
        data-active={isActive}
        className={cn(
          "flex items-center gap-4 transition-all cursor-pointer group rounded-lg border-[1px] border-solid border-brand-navy-light bg-brand-navy-light",
          {
            "hover:border-white/20": !isActive,
            "bg-whiteAlpha-100": isActive,
          },
          buttonClassName
        )}
      >
        {isIconType(icon) ? (
          <Icon
            icon={icon}
            size={24}
            className={cn(
              "transition group-hover:text-brand-white text-brand-gray",
              {
                "text-brand-white": isActive,
              },
              textClassName
            )}
          />
        ) : icon && typeof icon === "object" && "data" in icon ? (
          <div className="w-[24px] h-[24px] rounded-sm shadow overflow-hidden">
            <Image
              src={resolveStrapiImage(icon, { format: "xsmall" })}
              alt={`Icon for ${label} button`}
            />
          </div>
        ) : (
          icon
        )}

        <Text
          className={cn(
            "group-hover:text-brand-white transition font-accent font-medium",
            isActive && "text-brand-white",
            textClassName
          )}
        >
          {label}
        </Text>
      </div>
    </Clickable>
  );
};
