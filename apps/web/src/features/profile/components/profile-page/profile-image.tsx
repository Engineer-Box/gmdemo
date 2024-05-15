import { useToast } from "@/providers/toast-provider";
import { Dispatch, useEffect, useMemo, useState } from "react";
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
import {
  StrapiEntity,
  StrapiImage,
  StrapiRelation,
} from "@/types/strapi-types";

export type ImageUpload = {
  status: "idle" | "uploading" | "complete";
  detail: number;
};

export type ProfileImageProps = {
  isEditMode: boolean;
  imageUpload: ImageUpload;
  setImageUpload: Dispatch<ImageUpload>;
  avatar: StrapiRelation<StrapiEntity<StrapiImage>> | null;
};

const uppy = new Uppy().use(XHR, {
  endpoint: `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_HOST_NAME}/api/upload`,
  formData: true,
  fieldName: "files", // Strapi expects the file field to be called "files"
});

export const ProfileImage = ({
  isEditMode,
  imageUpload,
  setImageUpload,
  avatar,
}: ProfileImageProps) => {
  const { addToast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (imageFile) {
      uppy.cancelAll();
      setImageUpload({ status: "uploading", detail: 0 });
      uppy.addFile({
        name: imageFile.name,
        type: imageFile.type,
        data: imageFile,
      });
      uppy.upload();
    }
  }, [imageFile]);

  useEffect(() => {
    const onError: ErrorCallback = () => {
      setImageUpload({ status: "idle", detail: 0 });
      setImageFile(null);
      addToast({
        type: "error",
        message: "Image failed to upload",
      });
    };

    const onUploadProgress: UploadProgressCallback<any> = (file, progress) => {
      setImageUpload({
        status: "uploading",
        detail: (progress.bytesUploaded / progress.bytesTotal) * 100,
      });
    };

    const onUploadSuccess: UploadSuccessCallback<any> = (file, response) => {
      if (response.status === 200) {
        const imageId = response.body[0].id;
        setImageUpload({
          status: "complete",
          detail: imageId,
        });

        addToast({
          type: "success",
          message: "Image uploaded",
        });
      } else {
        addToast({
          type: "error",
          message: "Something went wrong",
        });
      }

      return file;
    };

    uppy.on("error", onError);
    uppy.on("upload-progress", onUploadProgress);
    uppy.on("upload-success", onUploadSuccess);

    return () => {
      uppy.off("error", onError);
      uppy.off("upload-progress", onUploadProgress);
      uppy.off("upload-success", onUploadSuccess);
    };
  }, []);

  const objectUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
  }, [imageFile]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded shadow-md group">
      <Image
        alt="profile image"
        src={objectUrl ?? resolveStrapiImage(avatar)}
      />
      {isEditMode && (
        <div className="absolute transition rounded cursor-pointer -inset-1 bg-brand-navy-accent-dark/60 hover:bg-brand-navy-accent-dark/70">
          <Text
            variant="p"
            className="absolute text-center transition -translate-x-1/2 -translate-y-1/2 cursor-pointer top-1/2 left-1/2 text-brand-white"
          >
            {imageUpload.status === "uploading"
              ? `${imageUpload.detail.toFixed(0)}%`
              : "Upload new image"}
          </Text>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={(e) =>
              setImageFile(e.target.files ? e.target.files[0] : null)
            }
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      )}
    </div>
  );
};
