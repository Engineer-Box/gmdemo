import { Heading } from "@/components/heading";
import { IconButton } from "@/components/icon-button";
import { PropsWithChildren } from "react";

export const SubSettingLayout = ({
  title,
  onClick,
  children,
}: PropsWithChildren<{
  title: string;
  onClick: () => void;
}>) => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-4 items-center ">
      <Heading variant="h3" className={"mb-0"}>
        {title}
      </Heading>
      <IconButton icon="round-plus" onClick={onClick} />
    </div>
    {children}
  </div>
);
