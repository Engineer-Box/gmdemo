import { isServer } from "@/utils/is-server";
import { useState, useLayoutEffect, useEffect } from "react";

/**
 * Start using the tailwind config to get the correct screen sizes:
 *
 * import resolveConfig from 'tailwindcss/resolveConfig'
 * import tailwindConfig from '../../tailwind.config.js'
 * const { theme } = resolveConfig(tailwindConfig)
 */

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const getCurrentBreakpoint = (): Breakpoint => {
  if (isServer()) {
    return "xs";
  }

  const width = window.innerWidth;

  if (width < breakpoints.sm) return "xs";
  if (width < breakpoints.md) return "sm";
  if (width < breakpoints.lg) return "md";
  if (width < breakpoints.xl) return "lg";
  if (width < breakpoints["2xl"]) return "xl";
  return "2xl";
};

const useBrowserLayoutEffect = isServer() ? useEffect : useLayoutEffect;
export const useTailwindBreakpoint = (
  targetBreakpoint: Breakpoint,
  options?: { fallback?: boolean }
): boolean => {
  const fallback = options?.fallback ?? false;
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint | null>(
    null
  );

  useBrowserLayoutEffect(() => {
    const handleResize = () => {
      setCurrentBreakpoint(getCurrentBreakpoint());
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return currentBreakpoint
    ? breakpoints[currentBreakpoint] >= breakpoints[targetBreakpoint]
    : fallback;
};
