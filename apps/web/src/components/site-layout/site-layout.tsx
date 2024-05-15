import { PropsWithChildren, ReactNode, useEffect, useState } from "react";

import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { cn } from "@/utils/cn";
import { useRouter } from "next/router";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

const sharedPageWidthClasses = "px-6 lg:pl-10 lg:pr-16";

export const SiteLayout = ({
  children,
  increasedPageWidth,
}: PropsWithChildren<{ increasedPageWidth?: boolean }>) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isBigScreen = useTailwindBreakpoint("lg", { fallback: true });
  const { asPath } = useRouter();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [asPath]);

  return (
    <div
      id="site-layout"
      className="relative z-0 flex h-full overflow-hidden bg-brand-navy"
    >
      <aside>
        <Sidebar
          closeSidebar={() => setIsSidebarOpen(false)}
          className={cn("bg-brand-navy-light w-60 max-w-full px-4 py-6", {
            "fixed z-30 right-full transition-all": !isBigScreen,
            "translate-x-full": !isBigScreen && isSidebarOpen,
          })}
        />
      </aside>
      <div className="overflow-y-auto grow">
        <div
          onClick={() => {
            setIsSidebarOpen(false);
          }}
          className={cn(
            "absolute inset-0 z-20 bg-black opacity-0 pointer-events-none",
            {
              "opacity-50 pointer-events-auto": isSidebarOpen && !isBigScreen,
            }
          )}
        />
        <Header
          className={cn(sharedPageWidthClasses, "z-10")}
          openSidebar={() => setIsSidebarOpen(true)}
        />
        <main
          className={cn(
            sharedPageWidthClasses,
            "z-0 mt-6 pb-10 max-w-5xl mx-auto",
            increasedPageWidth && "max-w-6xl"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
