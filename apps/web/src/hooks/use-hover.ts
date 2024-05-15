import { useRef, useState, useEffect } from "react";

export const useHover = () => {
  const [value, setValue] = useState<boolean>(false);

  const ref = useRef<HTMLElement>(null);

  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener("mouseover", handleMouseOver);
      node.addEventListener("mouseout", handleMouseOut);

      return () => {
        node.removeEventListener("mouseover", handleMouseOver);
        node.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, []);
  return { hoverRef: ref, isHovered: value } as const;
};
