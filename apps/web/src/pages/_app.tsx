import "@/styles/globals.css";
import { QueryClientProvider } from "@/providers/query-provider";
import type { AppProps } from "next/app";
import { SiteLayout } from "@/components/site-layout/site-layout";
import { ThirdwebProvider } from "@/providers/thirdweb-provider";
import { TokenProvider } from "@/providers/token-provider";
import React from "react";
import { ConditionallyWrap } from "@/components/conditionally-wrap";
import { RegistrationModalProvider } from "@/providers/registration-modal-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/utils/cn";
import { GlobalModalProvider } from "@/providers/global-modal-provider";
import { IsOnlineProvider } from "@/providers/is-online-provider";
import { SuspensionModalProvider } from "@/providers/suspension-modal-provider";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {process.env.NEXT_PUBLIC_APP_ENV === "production" && (
        <>
          <Script
            id="ga-1"
            strategy="lazyOnload"
            src={"https://www.googletagmanager.com/gtag/js?id=G-TNG0F90SLM"}
          />

          <Script id="ga-2" strategy="lazyOnload">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-TNG0F90SLM');
          `}
          </Script>
        </>
      )}
      <div className={cn("w-full h-full", inter.variable, bricolage.variable)}>
        <ThirdwebProvider>
          <TokenProvider>
            <QueryClientProvider>
              <ErrorBoundary>
                <ToastProvider>
                  <GlobalModalProvider>
                    <ConditionallyWrap
                      condition={!pageProps.hideSidebar}
                      Wrapper={({ children }) => (
                        <SiteLayout
                          increasedPageWidth={!!pageProps?.increasedPageWidth}
                        >
                          {children}
                        </SiteLayout>
                      )}
                    >
                      <SuspensionModalProvider>
                        <RegistrationModalProvider>
                          <IsOnlineProvider>
                            <Component {...pageProps} />
                          </IsOnlineProvider>
                        </RegistrationModalProvider>
                      </SuspensionModalProvider>
                    </ConditionallyWrap>
                  </GlobalModalProvider>
                </ToastProvider>
              </ErrorBoundary>
            </QueryClientProvider>
          </TokenProvider>
        </ThirdwebProvider>
      </div>
    </>
  );
}
