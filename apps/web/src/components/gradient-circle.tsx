import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";

export const GradientCircle = ({ className }: { className?: ClassValue }) => (
  <div
    className={cn("absolute top-[20%] left-0 w-screen h-full -z-10", className)}
  >
    <div className="blur-lg rounded-full absolute -inset-32 bg-[radial-gradient(at_center,var(--brand-color-primary-dark)_0%,_var(--brand-color-navy)_65%)] opacity-50" />
  </div>
);
