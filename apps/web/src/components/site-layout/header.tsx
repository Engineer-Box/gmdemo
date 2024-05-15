import { cn } from "@/utils/cn";
import { Button } from "../button";
import { Icon } from "../icon";
import { ClassValue } from "clsx";
import { ConnectWallet, darkTheme } from "@thirdweb-dev/react";
import { ProfileButtons } from "./profile-buttons";
import { useAuth } from "@/hooks/use-auth";
import { GlobalSearchBar } from "../../features/global-search/components/global-search-bar";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { NotificationsHeaderButton } from "@/features/notification/components/notification-header-button";

// TODO: We can replace the hacky thirdweb connect button with this - https://portal.thirdweb.com/references/react/v4/useSetIsWalletModalOpen

type HeaderProps = {
  openSidebar: () => void;
  className?: ClassValue;
};

export const THIRDWEB_CONNECT_BUTTON_CLASSNAME =
  "gamerly-thirdweb-connect-button";

export const Header = ({ openSidebar, className }: HeaderProps) => {
  const { user, logout } = useAuth();
  const shouldShowProfileButtons =
    user && user.data?.profile.username && user.data.profile.region;

  const isDesktop = useTailwindBreakpoint("md");
  const shouldShowNotificationsButton = useTailwindBreakpoint("lg");
  const handleOnConnect = async () => {
    const thirdwebButton = document.querySelector(
      `.${THIRDWEB_CONNECT_BUTTON_CLASSNAME}`
    ) as HTMLElement;

    thirdwebButton?.click();
  };

  return (
    <div
      className={cn(
        "sticky top-0 flex justify-between w-full py-6 lg:justify-end bg-brand-navy",
        className
      )}
    >
      <div className="flex items-center gap-6 lg:hidden">
        <div
          onClick={openSidebar}
          className="flex flex-col w-7 gap-1.5 cursor-pointer"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-[3px] rounded bg-white/70" />
          ))}
        </div>
        <img src="/logo.png" className="hidden object-contain w-12 lg:block" />
      </div>
      <div className="inline-flex gap-2 lg:gap-3">
        <div className="relative w-40 h-full xs:w-56 md:w-96">
          <GlobalSearchBar />
        </div>

        {shouldShowNotificationsButton && <NotificationsHeaderButton />}

        {!shouldShowProfileButtons && (
          <>
            <Button
              title={isDesktop ? "Exchange" : undefined}
              icon="exchange"
              variant="primary"
            />

            <div className="relative" onClick={handleOnConnect}>
              <Button
                title={isDesktop ? "Connect" : undefined}
                icon="profile"
                variant="secondary"
              />
              <ConnectWallet
                modalSize="compact"
                className={`!hidden ${THIRDWEB_CONNECT_BUTTON_CLASSNAME}`}
                switchToActiveChain={true}
                auth={{
                  loginOptional: false,
                }}
                theme={darkTheme({
                  colors: {
                    accentText: "var(--brand-color-primary)",
                    accentButtonBg: "var(--brand-color-primary)",
                  },
                })}
              />
            </div>
          </>
        )}
        {shouldShowProfileButtons && <ProfileButtons />}
      </div>
    </div>
  );
};
