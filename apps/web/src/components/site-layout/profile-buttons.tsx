import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "../button";
import * as Avatar from "@radix-ui/react-avatar";
import { useTailwindBreakpoint } from "@/hooks/use-tailwind-breakpoint";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { useEffect, useMemo, useState } from "react";
import { toUsdString } from "@/utils/to-usd-string";
import { Spinner } from "../spinner";
import { TransactionModal } from "@/features/transaction/components/transaction-modal";
import { usePendingBalance } from "@/hooks/use-pending-balance";
import { cn } from "@/utils/cn";
import { useLogOutModal } from "../log-out-modal";
import * as PopoverPrimitives from "@radix-ui/react-popover";
import { useRouter } from "next/router";
import { Text } from "../text";

type ProfileButtonsProps = {};

export const ProfileButtons = ({}: ProfileButtonsProps) => {
  const { user, logout } = useAuth();
  const isDesktop = useTailwindBreakpoint("md");
  const router = useRouter();
  const { balance, isBalanceLoading, hasPendingBalance } = usePendingBalance();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { openLogOutModal } = useLogOutModal();

  const [isProfileButtonOpen, setIsProfileButtonOpen] = useState(false);
  const username = user?.data?.profile?.username ?? "User";
  const profileImageUrl = user?.data.profile?.avatar
    ? resolveStrapiImage(user?.data.profile?.avatar ?? null, {
        noFallback: true,
      })
    : undefined;

  return (
    <>
      <div className="absolute">
        <TransactionModal
          isOpen={isWalletModalOpen}
          closeModal={() => setIsWalletModalOpen(false)}
        />
      </div>
      <div className="relative z-0 flex h-full gap-2 lg:gap-3">
        <Button
          title={typeof balance === "number" ? toUsdString(balance) : undefined}
          onClick={() => setIsWalletModalOpen(true)}
          variant={"primary"}
          disabled={!user || isBalanceLoading || hasPendingBalance}
          icon={
            isDesktop &&
            (isBalanceLoading || hasPendingBalance ? (
              <Spinner className="w-full" />
            ) : (
              "exchange"
            ))
          }
        />

        <div className="h-full">
          <PopoverPrimitives.Root
            open={isProfileButtonOpen}
            onOpenChange={setIsProfileButtonOpen}
          >
            <PopoverPrimitives.Trigger>
              <Button
                variant="secondary"
                title={isDesktop ? username ?? "Profile" : undefined}
                className="relative h-full overflow-hidden"
                iconSize={20}
                icon={
                  <>
                    {!isDesktop && (
                      <div
                        className={cn(
                          "absolute inset-0 bg-cover",
                          !profileImageUrl && "bg-pink-400",
                        )}
                        style={{
                          backgroundImage: profileImageUrl
                            ? `url("${profileImageUrl}")`
                            : undefined,
                        }}
                      >
                        {!profileImageUrl && (
                          <div className="flex text-black bg-pink-400  text-[13px] font-medium h-full w-full relative">
                            <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                              {username[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {isDesktop && (
                      <Avatar.Root className="inline-flex items-center justify-center w-full h-full overflow-hidden rounded-full select-none">
                        <Avatar.Image
                          className="h-full w-full rounded-[inherit] object-cover"
                          src={profileImageUrl}
                          alt={"Avatar"}
                        />
                        <Avatar.Fallback
                          className="flex text-black bg-pink-400  text-[13px] font-medium h-full w-full relative"
                          delayMs={600}
                        >
                          <span className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                            {username[0].toUpperCase()}
                          </span>
                        </Avatar.Fallback>
                      </Avatar.Root>
                    )}
                  </>
                }
              />
            </PopoverPrimitives.Trigger>
            <PopoverPrimitives.Portal>
              <PopoverPrimitives.Content
                className="will-change-[transform,opacity] data-[state=open]:data-[side=top]:animate-slideDownAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade"
                sideOffset={14}
              >
                <div className="bg-brand-navy-light w-20 md:w-[var(--radix-popover-trigger-width)] rounded overflow-hidden cursor-pointer">
                  <button
                    className="py-2 px-3.5 text-left w-full group transition"
                    onClick={() => {
                      setIsProfileButtonOpen(false);
                      router.push("/profile");
                    }}
                  >
                    <Text className={"group-hover:text-brand-white"}>
                      Profile
                    </Text>
                  </button>
                  <button
                    className="py-2 px-3.5 text-left w-full bg-brand-red hover:bg-brand-red-dark transition"
                    onClick={() => {
                      setIsProfileButtonOpen(false);
                      openLogOutModal();
                    }}
                  >
                    <Text className={"text-brand-white"}>Log out</Text>
                  </button>
                </div>
                <PopoverPrimitives.Arrow className="fill-brand-navy-light" />
              </PopoverPrimitives.Content>
            </PopoverPrimitives.Portal>
          </PopoverPrimitives.Root>
        </div>
      </div>
    </>
  );
};
