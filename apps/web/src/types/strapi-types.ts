export type StrapiEntity<T extends Record<string, any>> = {
  id: number;
  attributes: T & {
    createdAt: string; // ISO 8601
  };
};

export type StrapiRelation<
  T extends StrapiEntity<any> | StrapiEntity<any>[],
  Nullable = true,
> = Nullable extends true ? { data: T | null } : { data: T };

export type StrapiComponent<T extends Record<string, any>> =
  | (T & { id: number })
  | null;

export const isStrapiRelationDefined = <
  T extends StrapiRelation<StrapiEntity<any>, any>,
>(
  relation: T
): relation is T & { data: NonNullable<T["data"]> } => {
  return relation && typeof relation === "object" && relation.data !== null;
};

type ImageFormat = {
  width: number;
  height: number;
  url: string;
};

export type StrapiImage = {
  name: string;
  formats: {
    thumbnail: ImageFormat | null; // The available format depends on the image type uploaded
    xsmall: ImageFormat | null;
    medium: ImageFormat | null;
    large: ImageFormat | null;
  } | null;
} & ImageFormat;

export const isStrapiImage = (i: unknown): i is StrapiImage => {
  const image = i as StrapiImage;
  return (
    typeof image?.name === "string" &&
    typeof image?.width === "number" &&
    typeof image?.height === "number" &&
    typeof image?.url === "string"
  );
};
