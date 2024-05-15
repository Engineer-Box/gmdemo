import { InputHTMLAttributes } from "react";

type ImageInputProps = {} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "accept"
>;

export const ImageInput = (props: ImageInputProps) => (
  <input type="file" accept="image/jpeg, image/png" {...props} />
);
