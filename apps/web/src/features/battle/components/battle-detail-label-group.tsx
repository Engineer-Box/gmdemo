import { Text } from "@/components/text";
import { PropsWithChildren } from "react";

export const BattleDetailLabelGroup = ({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) => (
  <div className="flex gap-4 justify-stretch items-center w-full">
    <Text className={"w-[35%]"}>{title}</Text>
    <div className="flex-grow">{children}</div>
  </div>
);
