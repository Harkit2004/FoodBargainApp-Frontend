import { put } from "@vercel/blob";

const blobToken = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN;

if (!blobToken) {
  console.warn("VITE_BLOB_READ_WRITE_TOKEN is not set. Image uploads will fail.");
}

export type BlobEntityType = "restaurant" | "menu_item";

export interface UploadImageOptions {
  entityType?: BlobEntityType;
  ownerId: string;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg"]);

export const uploadImage = async (file: File, { entityType = "restaurant", ownerId }: UploadImageOptions) => {
  if (!blobToken) {
    throw new Error("Image uploads are not configured. Missing VITE_BLOB_READ_WRITE_TOKEN.");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPG and PNG files are supported.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 5MB or smaller.");
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(16).slice(2);
  const extension = file.type === "image/png" ? "png" : "jpg";
  const safeName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "image";

  const blobPath = `${entityType}s/${ownerId}/${timestamp}-${randomSuffix}-${safeName}.${extension}`;

  const result = await put(blobPath, file, {
    access: "public",
    contentType: file.type,
    token: blobToken,
  });

  return {
    url: result.url,
    pathname: result.pathname,
    contentType: result.contentType,
  };
};
