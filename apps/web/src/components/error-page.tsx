import { PropsWithChildren, ReactNode, useEffect, useMemo } from "react";
import { Heading } from "./heading";
import { Text } from "./text";
import { FaClock, FaQuestion } from "react-icons/fa";
import { FaWrench } from "react-icons/fa";
import { FaExclamationCircle } from "react-icons/fa";
import { useRouter } from "next/router";
import Link from "next/link";

export type ErrorPageProps = {
  type: "notFound" | "somethingWentWrong" | "siteMaintenance" | "rateLimited";
};

export const GeneralErrorPage = ({
  title,
  description,
  icon,
  children,
}: PropsWithChildren<{
  title?: string;
  description?: string;
  icon: ReactNode;
}>) => (
  <div className="flex flex-col justify-around h-full gap-20 md:items-center md:flex-row pt-12">
    <div>
      {title && (
        <Heading variant="h2" className={"mb-4"}>
          {title}
        </Heading>
      )}
      {description && <Text className="mb-4">{description}</Text>}
      {children}
    </div>
    <div className="flex items-center justify-center min-w-48 max-w-48 w-48 rounded aspect-square bg-brand-navy-light">
      <div className="[&>*]:w-28 [&>*]:h-28 [&>*]:fill-brand-white">{icon}</div>
    </div>
  </div>
);

export const ErrorPage = ({ type }: ErrorPageProps) => {
  const router = useRouter();

  switch (type) {
    case "rateLimited":
      return (
        <GeneralErrorPage
          title="Hold up! You're doing that too much!"
          description="You're doing that too much! Please wait a bit before trying again."
          icon={<FaClock />}
        ></GeneralErrorPage>
      );
    case "notFound":
      return (
        <GeneralErrorPage
          title="GGWP! Sorry, we couldn't find what you're looking for!"
          description="Find the thing you're looking for with the sidebar or search!"
          icon={<FaQuestion />}
        ></GeneralErrorPage>
      );

    case "siteMaintenance":
      return (
        <GeneralErrorPage
          title="Sorry, we're doing some maintenance!"
          icon={<FaWrench />}
        >
          <Text>
            This site is currently down. We apologise for any inconvenience
            caused. Keep up to date for when we are live again by following us
            on{" "}
            <Link href="https://twitter.com/gamerlyapp" target="_blank">
              <span className="underline underline-offset-2">Twitter</span>
            </Link>
          </Text>
        </GeneralErrorPage>
      );
    default:
      return (
        <GeneralErrorPage
          title="Something went wrong"
          icon={<FaExclamationCircle />}
          description="If this error continues please let us know at support@gamerly.app"
        >
          <Text
            onClick={() => {
              const onErrorPage =
                router.asPath === "/500" ||
                router.asPath === "/404" ||
                router.asPath === "/503" ||
                router.asPath === "/429";

              if (onErrorPage) {
                router.replace("/");
              } else {
                router.reload();
              }
            }}
            className={"underline underline-offset-2 cursor-pointer"}
          >
            Try refreshing the page
          </Text>
        </GeneralErrorPage>
      );
  }
};
