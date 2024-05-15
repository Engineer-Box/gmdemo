import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";
import { HTMLAttributes, ReactNode, useCallback, useMemo } from "react";

export type SkeletonProps = {
  className?: ClassValue;
  type?: "image";
  dark?: boolean;
  asSpan?: boolean;
};

const Div = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

const Span = ({ children, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);

export const Skeleton = ({
  className,
  type,
  dark,
  asSpan,
  children,
  ...props
}: SkeletonProps & Omit<HTMLAttributes<HTMLDivElement>, "className">) => {
  const Tag = useCallback(
    ({ children, className }: { children?: ReactNode; className?: string }) =>
      asSpan ? (
        <span className={cn(className, "block")}>{children}</span>
      ) : (
        <div className={className}>{children}</div>
      ),
    [asSpan]
  );
  return (
    <Tag
      className={cn(
        "animate-pulse  rounded-[5px] bg-brand-navy-light overflow-hidden relative z-0",
        dark && "bg-brand-navy",
        className
      )}
      {...props}
    >
      <Tag className="invisible ">{children}</Tag>
      {type === "image" && (
        <Tag className="flex items-center justify-center w-full h-full">
          <Tag className="relative  w-10 max-w-full text-white/10">
            <svg
              className="w-full h-full"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 18"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
            <Tag
              className={cn(
                "absolute  inset-1 bg-brand-navy-light -z-10 ",
                dark && "bg-brand-navy"
              )}
            />
          </Tag>
        </Tag>
      )}
    </Tag>
  );
};
