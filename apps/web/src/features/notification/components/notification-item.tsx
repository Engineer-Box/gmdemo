import { PropsWithChildren } from "react";
import { NotificationResponse } from "../notification-service";
import { Image } from "@/components/image";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { Text } from "@/components/text";
import { timeAgo } from "../util";
import { useNotifications } from "../use-notifications";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";

type NotificationItemProps = PropsWithChildren<{
  onNotificationClick?: () => void;
  image?: StrapiRelation<StrapiEntity<StrapiImage>> | StrapiImage;
  notification: NotificationResponse;
  hideBottomBorder?: boolean;
}>;

export const NotificationItem = ({
  image,
  hideBottomBorder,
  onNotificationClick,
  notification,
  children,
}: NotificationItemProps) => {
  return (
    <div className="relative z-90">
      <div className="px-3 py-4">
        <div className="flex items-center gap-4">
          <div className="min-w-[34px] min-h-[34px] h-[34px] w-[34px] rounded-full overflow-hidden">
            <Image
              alt={`Notification thumbnail for ${notification.id}`}
              src={resolveStrapiImage(image)}
            />
          </div>
          <div className="w-full grow">
            <Text className={"mb-1.5"}>{children}</Text>
            <Text className={"text-xs text-brand-primary"}>
              {timeAgo(notification.attributes.createdAt)}
            </Text>
          </div>
          {onNotificationClick && (
            <div className="flex justify-end ml-4">
              <button
                onClick={() => {
                  onNotificationClick?.();
                }}
                className="px-3 py-2 text-xs transition rounded text-brand-white bg-brand-navy hover:bg-brand-navy/80"
              >
                View
              </button>
            </div>
          )}
        </div>
        {!hideBottomBorder && (
          <div className="absolute left-0 w-full bottom-0 bg-white/10 h-[1px] " />
        )}
      </div>
    </div>
  );
};
