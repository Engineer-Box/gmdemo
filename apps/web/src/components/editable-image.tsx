import { useToast } from "@/providers/toast-provider";
import { ChangeEvent, Dispatch, useEffect, useMemo, useState } from "react";
import Uppy, {
  ErrorCallback,
  FileProgress,
  SuccessResponse,
  UploadProgressCallback,
  UploadSuccessCallback,
  UppyFile,
} from "@uppy/core";
import XHR from "@uppy/xhr-upload";
import { resolveStrapiImage } from "@/utils/resolve-strapi-image";
import { Text } from "@/components/text";
import { Skeleton } from "@/components/skeleton";
import { Image } from "@/components/image";
import { useStrapiImageUpload } from "@/hooks/use-strapi-image-upload";
import { ClassValue } from "clsx";
import { cn } from "@/utils/cn";
import { ImageInput } from "./image-input";
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";

export type EditableImageProps = {
  isEditMode: boolean;
  initialImage?: StrapiRelation<StrapiEntity<StrapiImage>> | null;
  editContainerClassName?: ClassValue;
  editTextClassName?: ClassValue;
} & Pick<
  ReturnType<typeof useStrapiImageUpload>,
  "fileObjectUrl" | "onFileInputChange" | "imageUploadState"
>;

export const EditableImage = ({
  isEditMode,
  initialImage = null,
  fileObjectUrl,
  editContainerClassName,
  editTextClassName,
  onFileInputChange,
  imageUploadState,
}: EditableImageProps) => {
  return (
    <div className="relative w-full h-full overflow-hidden rounded shadow-md group">
      <Image
        alt="editable image"
        src={fileObjectUrl ?? resolveStrapiImage(initialImage)}
      />
      {isEditMode && (
        <div
          className={cn(
            "absolute transition rounded cursor-pointer -inset-1 bg-brand-navy-accent-dark/60 hover:bg-brand-navy-accent-dark/70",
            editContainerClassName
          )}
        >
          <Text
            variant="p"
            className={cn(
              "absolute text-center transition -translate-x-1/2 -translate-y-1/2 cursor-pointer top-1/2 left-1/2 text-brand-white",
              editTextClassName
            )}
          >
            {imageUploadState.status === "uploading"
              ? `${imageUploadState.detail.toFixed(0)}%`
              : "Upload new image"}
          </Text>
          <ImageInput
            onChange={onFileInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
