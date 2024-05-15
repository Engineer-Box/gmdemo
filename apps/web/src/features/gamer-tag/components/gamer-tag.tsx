import { Text } from "@/components/text";
import { cn } from "@/utils/cn";
import { Copy } from "@/components/copy";

export const GamerTag = ({
  tag,
  className,
}: {
  tag: string;
  className?: string;
}) => (
  <div
    className={cn("inline-flex items-center gap-2  text-brand-gray", className)}
  >
    <Text className={className}>{tag}</Text>
    <Copy value={tag} />
  </div>
);
