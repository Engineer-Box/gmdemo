import { Button } from "@/components/button";
import * as PopoverPrimitives from "@radix-ui/react-popover";
import { NotificationsContent } from "./notifications-content";
import { NotificationBell } from "./notification-bell";
import { useNotifications } from "../use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export const NotificationsHeaderButton = () => {
  const { hasUnseenNotifications, markAllAsSeen } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const { user, signIn } = useAuth();
  return (
    <PopoverPrimitives.Root open={isOpen} onOpenChange={setIsOpen}>
      <PopoverPrimitives.Trigger>
        <Button
          className="h-full px-3.5"
          variant={"secondary"}
          onClick={() => {
            if (!user) {
              signIn(false);
              setIsOpen(false);
            } else {
              markAllAsSeen();
            }
          }}
          icon={<NotificationBell hasNotifications={hasUnseenNotifications} />}
        />
      </PopoverPrimitives.Trigger>
      <PopoverPrimitives.Portal>
        <PopoverPrimitives.Content
          className="w-[26rem] will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade "
          sideOffset={14}
        >
          <NotificationsContent
            onMarkAllReadClick={() => setIsOpen(false)}
            onNotificationClick={() => setIsOpen(false)}
          />
          <PopoverPrimitives.Arrow className="fill-brand-navy-light" />
        </PopoverPrimitives.Content>
      </PopoverPrimitives.Portal>
    </PopoverPrimitives.Root>
  );
};
