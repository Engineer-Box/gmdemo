import { Icon } from "@/components/icon";

type NotificationBellProps = {
  hasNotifications?: boolean;
} & Omit<Parameters<typeof Icon>[0], "icon">;

export const NotificationBell = ({
  hasNotifications,
  ...iconProps
}: NotificationBellProps) => (
  <div>
    <div className="inline-block">
      <div className="relative text-brand-gray">
        {hasNotifications && (
          <div className="absolute right-[1px] top-[1px] w-[6px] h-[6px] bg-brand-primary rounded-full " />
        )}
        <Icon icon="bell" size={16} {...iconProps} />
      </div>
    </div>
  </div>
);
