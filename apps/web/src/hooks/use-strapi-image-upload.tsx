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
import { useToast } from "@/providers/toast-provider";

export type StrapiImageUploadState = {
  status: "idle" | "uploading" | "complete" | "error";
  detail: number; // the progress or uploaded image ID
};

export const useStrapiImageUpload = () => {
  const [imageUploadState, setImageUploadState] =
    useState<StrapiImageUploadState>({
      status: "idle",
      detail: 0,
    });
  const uppy = useMemo(
    () =>
      new Uppy().use(XHR, {
        endpoint: `${process.env.NEXT_PUBLIC_API_PROTOCOL}://${process.env.NEXT_PUBLIC_API_HOST_NAME}/api/upload`,
        formData: true,
        fieldName: "files", // Strapi expects the file field to be called "files"
      }),
    []
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { addToast } = useToast();
  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files ? e.target.files[0] : null);
  };

  const resetUploadState = () => {
    setImageUploadState({ status: "idle", detail: 0 });
  };

  const resetFileState = () => {
    setImageFile(null);
  };
  const fileObjectUrl = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (imageFile) {
      uppy.cancelAll();
      setImageUploadState({ status: "uploading", detail: 0 });
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
      setImageUploadState({ status: "error", detail: 0 });
      setImageFile(null);
      addToast({
        type: "error",
        message: "Image failed to upload",
      });
    };

    const onUploadProgress: UploadProgressCallback<any> = (file, progress) => {
      setImageUploadState({
        status: "uploading",
        detail: (progress.bytesUploaded / progress.bytesTotal) * 100,
      });
    };

    const onUploadSuccess: UploadSuccessCallback<any> = (file, response) => {
      if (response.status === 200) {
        const imageId = response.body[0].id;
        setImageUploadState({
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

  return {
    fileObjectUrl,
    onFileInputChange,
    resetUploadState,
    resetFileState,
    imageUploadState,
  } as const;
};
