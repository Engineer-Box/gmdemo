import { ReactNode, useEffect, useState } from "react";
import { SidebarButton, SidebarButtonProps } from "./sidebar-button";
import { Skeleton } from "../skeleton";
import { cn } from "@/utils/cn";
import { Icon } from "../icon";
import { Collapsable } from "../collapsable";
import { ClassValue } from "clsx";

type BaseSidebarGroupProps = {
  buttons: SidebarButtonProps[];
  sidebarGroupClassName?: ClassValue;
};

type CollapsableSidebarGroupProps = BaseSidebarGroupProps & {
  collapsable: true;
  title: string;
};

type NonCollapsableSidebarGroupProps = BaseSidebarGroupProps & {
  collapsable?: false;
  title?: string;
};

type SidebarGroupProps =
  | CollapsableSidebarGroupProps
  | NonCollapsableSidebarGroupProps;

export const SidebarGroupSkeleton = () => {
  return (
    <div>
      <Skeleton className="w-full h-5 mb-2" dark />
      <div className="flex items-center gap-2 ml-2">
        <Icon
          size={24}
          icon="image"
          className="text-brand-navy animate-pulse"
        />
        <Skeleton dark className="w-full h-3" />
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Icon
          size={24}
          icon="image"
          className="text-brand-navy animate-pulse"
        />
        <Skeleton dark className="w-full h-3" />
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Icon
          size={24}
          icon="image"
          className="text-brand-navy animate-pulse"
        />
        <Skeleton dark className="w-full h-3" />
      </div>
    </div>
  );
};

const SidebarGroupContent = ({
  buttons,
  sidebarGroupClassName,
}: Pick<SidebarGroupProps, "buttons" | "sidebarGroupClassName">) => (
  <ul className={cn("flex flex-col gap-2", sidebarGroupClassName)}>
    {buttons.map((button) => (
      <li key={button.label}>
        <SidebarButton
          {...button}
          buttonClassName={cn("p-2", button.buttonClassName)}
        />
      </li>
    ))}
  </ul>
);

export const SidebarGroup = ({
  title,
  collapsable,
  buttons,
  sidebarGroupClassName,
}: SidebarGroupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div>
      {title && (
        <div className="font-medium text-md text-brand-gray">
          {!collapsable && <p className="p-2">{title}</p>}
          {collapsable && (
            <Collapsable isOpen={isOpen} setIsOpen={setIsOpen}>
              <div className="flex items-center justify-between p-2 ">
                <p className="">{title}</p>
                <div
                  className={cn(
                    isOpen ? "rotate-0" : "-rotate-90",
                    "transition-all"
                  )}
                >
                  <Icon size={10} icon="chevron-down" />
                </div>
              </div>
              <SidebarGroupContent
                buttons={buttons}
                sidebarGroupClassName={sidebarGroupClassName}
              />
            </Collapsable>
          )}
        </div>
      )}
      {!collapsable && (
        <SidebarGroupContent
          buttons={buttons}
          sidebarGroupClassName={sidebarGroupClassName}
        />
      )}
    </div>
  );
};
