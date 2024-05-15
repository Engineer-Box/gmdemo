import { useEffect } from "react";

export const useOnResize = (
  callback: () => void,
  runOnInitialRender: boolean = true
) => {
  useEffect(() => {
    window.addEventListener("resize", callback);
    if (runOnInitialRender) {
      callback();
    }
    return () => window.removeEventListener("resize", callback);
  }, []);
};
