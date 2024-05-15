import { useCallback, useEffect, useRef } from "react";

type AnyElement = HTMLElement | null;

export const useOutsideClick = (callback: (e: MouseEvent) => void) => {
  const refs = useRef<AnyElement[]>([]);

  const registerRefForOutsideClick = useCallback(() => {
    const ref = (element: AnyElement) => {
      if (element && !refs.current.includes(element)) {
        refs.current.push(element);
      }
    };
    return ref;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.current.every(
        (ref) => ref && !ref.contains(event.target as Node)
      );
      if (isOutside) {
        callback(event);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return { registerRefForOutsideClick };
};
