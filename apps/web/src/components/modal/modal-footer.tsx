import { ReactNode } from "react";

export const ModalFooter = ({ children }: { children: ReactNode }) => (
  <div className="relative py-4 -z-10 px-7">
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-brand-navy" />
    {children}
  </div>
);
