import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { cn } from "@/utils/cn";
import { PropsWithChildren, useMemo, useState } from "react";
import { SidebarButton, SidebarButtonProps } from "./sidebar-button";
import { ClassValue } from "clsx";
import { useRouter } from "next/router";
import { SidebarGroup, SidebarGroupSkeleton } from "./sidebar-group";
import { useAuth } from "@/hooks/use-auth";
import { isStrapiRelationDefined } from "@/types/strapi-types";
import { CreateTeamModal } from "@/features/team/components/create-team-modal/create-team-modal";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { useNotifications } from "@/features/notification/use-notifications";
import { NotificationsModal } from "@/features/notification/components/notifications-modal";

type SidebarProps = {
  className?: ClassValue;
  closeSidebar: () => void;
};

export const Sidebar = ({
  className,
  closeSidebar,
}: PropsWithChildren<SidebarProps>) => {
  const { pathname, asPath, query } = useRouter();
  const route = pathname.split("/")[1] || "home";
  const { user, isUserLoading, signIn } = useAuth();
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const isDesktop = useTailwindBreakpoint("lg", { fallback: true });
  const { hasUnseenNotifications } = useNotifications();
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] =
    useState(false);
  const isOnFavouriteGamePage = useMemo(() => {
    const favouriteGameSlugs =
      user?.data.profile.favourite_games.data?.map((g) => g.attributes.slug) ??
      [];

    if (!favouriteGameSlugs.length || !query.slug) return false;

    return favouriteGameSlugs.includes(query.slug as string);
  }, [user?.data.profile.favourite_games, query]);

  const teamButtons: SidebarButtonProps[] = useMemo(() => {
    const teamProfiles = user?.data.profile.team_profiles.data || [];

    const buttons = teamProfiles
      .map((tp) => {
        if (
          tp.attributes.is_pending ||
          !isStrapiRelationDefined(tp.attributes.team)
        ) {
          return false;
        }

        return {
          label: tp.attributes.team.data.attributes.name,
          icon: tp.attributes.team.data.attributes.image,
          action: `/team/${tp.attributes.team.data.id}`,
          isActive: asPath === `/team/${tp.attributes.team.data.id}`,
        };
      })
      .filter(Boolean) as SidebarButtonProps[];

    const createTeamButton: SidebarButtonProps = {
      label: "Create Team",
      icon: "square-plus",
      action: () => {
        if (user) {
          setIsCreateTeamModalOpen((p) => !p);
        } else {
          signIn(false);
        }
      },
      isActive: false,
    };

    buttons.push(createTeamButton);

    return buttons;
  }, [user, asPath]);

  const favouriteGameButtons: SidebarButtonProps[] = useMemo(() => {
    const favouriteGames = user?.data.profile.favourite_games.data || [];

    const buttons = favouriteGames.map((game) => {
      return {
        label: game.attributes.title,
        icon: game.attributes.square_image,
        action: `/battles/${game.attributes.slug}`,
        isActive: asPath === `/battles/${game.attributes.slug}`,
      };
    }) as SidebarButtonProps[];

    return buttons;
  }, [user?.data.profile.favourite_games, asPath]);

  return (
    <>
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        setIsOpen={setIsNotificationsModalOpen}
      />

      {user && (
        <CreateTeamModal
          user={user}
          isOpen={isCreateTeamModalOpen}
          setIsOpen={setIsCreateTeamModalOpen}
        />
      )}
      <div
        className={cn(
          "flex flex-col bg-brand-navy-light h-full min-h-full",
          className
        )}
      >
        <div className="flex items-center gap-5">
          <img src="/logo.png" className="w-12" />
          <h2 className="text-2xl font-medium font-accent text-brand-white">
            Gamerly
          </h2>
        </div>

        <nav className="flex flex-col justify-between gap-4 mt-8 overflow-y-auto">
          <SidebarGroup
            buttons={[
              {
                label: "Home",
                icon: "home",
                action: "/",
                isActive: route === "home",
              },
              {
                label: "Battles",
                icon: "battles",
                action: "/battles",
                isActive: route === "battles" && !isOnFavouriteGamePage,
              },
              {
                label: "Tournaments",
                icon: "tournament",
                action: "/coming-soon",

                isActive: route === "coming-soon",
              },
              ...(!isDesktop
                ? [
                    {
                      label: "Notifications",
                      icon: (
                        <NotificationBell
                          hasNotifications={hasUnseenNotifications}
                        />
                      ),
                      action: () => {
                        if (user) {
                          setIsNotificationsModalOpen(true);
                        } else {
                          signIn(false);
                        }
                        closeSidebar();
                      },
                    },
                  ]
                : []),
            ]}
          />

          {isUserLoading && <SidebarGroupSkeleton />}
          {!isUserLoading && (
            <SidebarGroup
              title="Teams"
              collapsable={true}
              buttons={teamButtons}
              sidebarGroupClassName="max-h-[180px] overflow-y-auto"
            />
          )}
          {!isUserLoading && (
            <SidebarGroup
              title="Favourites"
              collapsable={true}
              buttons={favouriteGameButtons}
              sidebarGroupClassName="max-h-[180px] overflow-y-auto"
            />
          )}
        </nav>
        <div className="mt-auto">
          <SidebarGroup
            buttons={[
              {
                label: "Settings",
                icon: "settings",
                action: "/settings",
                isActive: route === "settings",
              },
              {
                label: "Profile",
                icon: "profile",
                action: "/profile",
                isActive: route === "profile",
                textClassName: "text-brand-white",
                buttonClassName:
                  "bg-brand-primary hover:bg-brand-primary-dark data-[active=true]:bg-brand-primary-dark data-[active=true]:border-brand-primary",
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};
