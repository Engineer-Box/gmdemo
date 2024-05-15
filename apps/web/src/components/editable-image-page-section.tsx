import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { ReactNode } from "react";
import { EditableImage } from "./editable-image";
import { Button } from "./button";
import { Skeleton } from "./skeleton";

type EditableImagePageSectionProps = {
  TitleSection: ReactNode;
  ContentSection: ReactNode;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  showEditButton: boolean;
  onSave?: (() => void) | (() => Promise<void>);
} & Parameters<typeof EditableImage>[0];

const EditableImagePageSectionLayout = ({
  Left,
  TopRight,
  BottomRight,
}: {
  Left: ReactNode;
  TopRight: ReactNode;
  BottomRight: ReactNode;
}) => (
  <div className="relative z-0">
    <div className="flex gap-4 md:gap-6">
      <div className="w-40">
        <AspectRatio ratio={1}>{Left}</AspectRatio>
      </div>
      <div className="flex-1">
        <div className="flex flex-col gap-1 h-full">
          <div className="flex flex-col items-start gap-2 mb-2 md:gap-4 xs:items-center xs:flex-row xs:mb-0">
            {TopRight}
          </div>
          {BottomRight}
        </div>
      </div>
    </div>
  </div>
);

export const EditableImagePageSectionSkeleton = () => (
  <EditableImagePageSectionLayout
    Left={<Skeleton className="w-full h-full " type="image" />}
    TopRight={<Skeleton className="w-24 h-10 mb-2 xs:w-56" />}
    BottomRight={
      <>
        <Skeleton className="h-4 mb-2 xs:w-96" />
        <Skeleton className="h-4 mb-2 xs:w-80" />
        <Skeleton className="h-4 xs:w-96" />
      </>
    }
  />
);

export const EditableImagePageSection = ({
  isEditMode,
  setIsEditMode,
  TitleSection,
  ContentSection,
  fileObjectUrl,
  imageUploadState,
  onSave,
  showEditButton,
  onFileInputChange,
  initialImage,
}: EditableImagePageSectionProps) => {
  return (
    <EditableImagePageSectionLayout
      Left={
        <EditableImage
          isEditMode={isEditMode}
          initialImage={initialImage}
          imageUploadState={imageUploadState}
          fileObjectUrl={fileObjectUrl}
          onFileInputChange={onFileInputChange}
        />
      }
      TopRight={
        <>
          <div>{TitleSection}</div>
          {showEditButton && (
            <Button
              disabled={imageUploadState.status === "uploading"}
              onClick={async () => {
                if (isEditMode) {
                  try {
                    await onSave?.();
                    setIsEditMode(false);
                  } catch (error) {}
                } else {
                  setIsEditMode(true);
                }
              }}
              title={isEditMode ? "Save" : "Edit"}
              size="sm"
              variant={isEditMode ? "primary" : "secondary"}
              className="duration-75"
            />
          )}
        </>
      }
      BottomRight={ContentSection}
    />
  );
};
