import { Text, textVariantClassnames } from "@/components/text";
import { cn } from "@/utils/cn";
import { RefObject, forwardRef, useEffect, useRef } from "react";

const removeNewLines = (text: string) => text.replace(/\n/g, "");

type ProfileBioProps = {
  isEditMode: boolean;
  bio: string | null;
  bioRef: RefObject<HTMLParagraphElement>;
};

export const ProfileBio = ({ isEditMode, bio, bioRef }: ProfileBioProps) => {
  useEffect(() => {
    if (isEditMode) {
      bioRef.current?.focus();
    }
  }, [isEditMode]);

  return (
    <p
      contentEditable={isEditMode && ("plaintext-only" as any)}
      ref={bioRef}
      className={cn(
        textVariantClassnames.p,
        "cursor-default w-full py-1",
        isEditMode &&
          "border border-solid text-brand-white rounded cursor-text outline-none px-1 focus:outline-none border-brand-navy-accent-light focus:border-brand-gray"
      )}
      onKeyDown={(e) => {
        if (e.code === "Enter") {
          e.preventDefault();
        }
      }}
    >
      {removeNewLines(isEditMode ? bio || "Once upon a time..." : bio || "")}
    </p>
  );
};
