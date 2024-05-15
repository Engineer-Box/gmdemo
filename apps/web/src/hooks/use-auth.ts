import { THIRDWEB_CONNECT_BUTTON_CLASSNAME } from "@/components/site-layout/header";
import { ProfileResponse } from "@/features/profile/types";
import {
  UserWithData,
  useDisconnect,
  useLogout,
  useUser,
} from "@thirdweb-dev/react";
import { log } from "console";
import { useRouter } from "next/router";
import { useEffect } from "react";

export type AuthenticatedUser = {
  address: string;
  data: {
    profile: ProfileResponse["attributes"] & { id: ProfileResponse["id"] };
    token: string;
  };
};

const isAuthenticatedUser = (d: unknown): d is AuthenticatedUser => {
  const user = d as AuthenticatedUser;

  return !!(
    user?.address &&
    user?.data &&
    user?.data?.profile &&
    user?.data?.token
  );
};

export const useAuth = () => {
  {
    const { user: untypedUser, isLoading } = useUser();
    const { logout: thirdWebLogout } = useLogout();
    const router = useRouter();
    const disconnectWallet = useDisconnect();
    const user = isAuthenticatedUser(untypedUser) ? untypedUser : null;
    const authStatus = isLoading
      ? "loading"
      : user
        ? "authenticated"
        : "unauthenticated";
    const completedRegistration =
      user?.data.profile.username && user?.data.profile.region;

    const logout = () => {
      thirdWebLogout();
      disconnectWallet();
      router.replace("/");
    };

    const signIn = (shouldRedirect: boolean = true) => {
      if (shouldRedirect) {
        router.replace("/");
      }

      // Redirect home and open the connect button modal
      const thirdWebButton = document.querySelector(
        `.${THIRDWEB_CONNECT_BUTTON_CLASSNAME}`
      );

      if (thirdWebButton) {
        (thirdWebButton as HTMLElement).click();
      }
    };

    return {
      user,
      isUserLoading: isLoading,
      logout,
      completedRegistration,
      signIn,
      authStatus,
    } as const;
  }
};
