import { useEffect, useCallback } from "react";

type Key = "ArrowDown" | "ArrowUp" | "ArrowLeft" | "ArrowRight" | "Enter";

export const useKeyPress = (
  callback: (key: Key) => void,
  deps?: any[]
): void => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const keyMap: Record<string, Key> = {
        ArrowDown: "ArrowDown",
        ArrowUp: "ArrowUp",
        ArrowLeft: "ArrowLeft",
        ArrowRight: "ArrowRight",
        Enter: "Enter",
      };

      const key = keyMap[event.key];
      if (key) {
        callback(key);
      }
    },
    [callback, ...(deps ?? [])]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);
};
