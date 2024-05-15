import { useUser } from "@thirdweb-dev/react";
import { ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createStore, useStore } from "zustand";
import { useAuth } from "@/hooks/use-auth";

// TODO: Delete this and replace it with queryClient.getQueryData<ThirdWebUser>(["tw-cache", "user"])?.data?.token

type TokenStore = {
  token: string | null;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setToken: (token: string | null) => void;
};

export const tokenStore = createStore<TokenStore>((set) => ({
  token: null,
  isLoading: true,
  setIsLoading(isLoading) {
    set({ isLoading });
  },
  setToken(token) {
    set({ token });
  },
}));

export const useToken = () => {
  const { token, isLoading, setIsLoading, setToken } = useStore(tokenStore);

  return { token, isTokenLoading: isLoading };
};

export const TokenProvider = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useAuth();
  const { token, setToken, setIsLoading } = useStore(tokenStore);

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    const dataToken = user?.data?.token;

    if (dataToken) {
      setToken(dataToken);
    } else {
      setToken(null);
    }

    setIsLoading(false);
  }, [user, isUserLoading]);

  return <>{children}</>;
};
