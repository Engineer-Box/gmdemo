import { TableCell, TableRow } from "@/components/table";
import { cn } from "@/utils/cn";
import { ReactNode } from "react";

export const LeaderboardRowLayout = ({
  children,
  isDark,
  className,
}: {
  isDark?: boolean;
  className?: string;
  children:
    | [ReactNode, ReactNode, ReactNode, ReactNode, ReactNode, ReactNode]
    | [
        ReactNode,
        ReactNode,
        ReactNode,
        ReactNode,
        ReactNode,
        ReactNode,
        ReactNode,
      ];
}) => {
  return (
    <TableRow
      isDark={isDark}
      className={cn("px-5 md:px-8 py-2 md:py-2", className)}
    >
      <TableCell isCentered className="w-[10%]">
        {children[0]}
      </TableCell>
      <TableCell className="w-[70%] md:w-[50%]">{children[1]}</TableCell>
      <TableCell isCentered className="w-[10%]">
        {children[2]}
      </TableCell>
      <TableCell isCentered className="w-[10%]">
        {children[3]}
      </TableCell>
      <TableCell isCentered className="hidden w-[10%] md:block">
        {children[4]}
      </TableCell>
      <TableCell isCentered className="hidden w-[10%] md:block">
        {children[5]}
      </TableCell>
      {children[6]}
    </TableRow>
  );
};
