import { useClipboard } from "@/hooks/use-clipboard";
import { useHover } from "@/hooks/use-hover";
import { Tooltip } from "./tooltip";
import { CopyIcon } from "@radix-ui/react-icons";

export const Copy = ({ value }: { value: string }) => {
  const { onCopy, hasCopied } = useClipboard(value);
  const { hoverRef, isHovered } = useHover();
  const copyMessage = hasCopied ? "Copied" : isHovered ? "Copy" : undefined;

  return (
    <div className="text-brand-white">
      <Tooltip content={copyMessage} side="right">
        <CopyIcon
          ref={hoverRef as any}
          className="cursor-pointer"
          onClick={onCopy}
          width={14}
        />
      </Tooltip>
    </div>
  );
};
