import { useAuth } from "@/hooks/use-auth";
import { strapiApi } from "@/lib/strapi";
import { useQuery } from "@tanstack/react-query";
import { PropsWithChildren, useEffect } from "react";

export const IsOnlineProvider = ({ children }: PropsWithChildren<{}>) => {
  const { user } = useAuth();

  useEffect(() => {
    const logOnlineUser = async () => {
      if (!user) return;
      try {
        await strapiApi.request("GET", "/profiles/log-online-user", {});
      } catch (error) {}
    };

    const interval = setInterval(logOnlineUser, 1000 * 5 * 60);
    logOnlineUser();

    return () => clearInterval(interval);
  }, [user]);

  return <>{children}</>;
};
