import { PropsWithChildren } from "react";
import {
  QueryClient,
  QueryClientProvider as QCProvider,
  QueryCache,
  DefaultOptions,
  QueryObserverOptions,
} from "@tanstack/react-query";
import Router from "next/router";
import { StrapiError } from "@/utils/strapi-error";

const isGlobalError = (error: unknown) => {
  const isStrapiError = StrapiError.isStrapiError(error);
  const status = isStrapiError ? error.error.status : null;

  if (status === 503 || status === 429) {
    return status;
  }

  return null;
};
const defaultOptions: QueryObserverOptions<any> = {
  retry(failureCount, error) {
    if (isGlobalError(error)) return false;

    return failureCount < 3;
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultOptions as any,
    mutations: defaultOptions as any,
  },
  queryCache: new QueryCache({
    onSettled(data, error, query) {},
    onError: (error) => {
      const globalError = isGlobalError(error);

      if (globalError) {
        const errorPagePath = `/${globalError}`;

        if (Router.asPath !== errorPagePath) {
          Router.push(errorPagePath);
        }
      }
    },
  }),
});

export const QueryClientProvider = (props: PropsWithChildren) => {
  return <QCProvider client={queryClient}>{props.children}</QCProvider>;
};
