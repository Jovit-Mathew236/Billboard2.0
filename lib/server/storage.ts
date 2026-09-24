import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { HttpError } from "./auth";

const region = process.env.AWS_S3_REGION ?? process.env.NEXT_PUBLIC_AWA_S3_BUCKET_REGION ?? "";

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY ?? process.env.NEXT_PUBLIC_AWS_S3_BUCKET_ACCESS_KEY ?? "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY ?? process.env.NEXT_PUBLIC_AWS_S3_BUCKET_SECRET_ACCESS_KEY ?? "",
  },
});

const bucket = () => {
  const name = process.env.AWS_S3_BUCKET ?? process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  if (!name) throw new HttpError(500, "Storage bucket is not configured.");
  return name;
};

export const UPLOAD_PROFILES = {
  carousel: { prefix: "imagetemp", maxDimension: 2560, quality: 80 },
  background: { prefix: "global", maxDimension: 3840, quality: 90 },
  avatar: { prefix: "users", maxDimension: 512, quality: 80 },
  lab: { prefix: "labs", maxDimension: 1200, quality: 82 },
} as const;

export type UploadProfile = keyof typeof UPLOAD_PROFILES;

const MAX_BYTES = 15 * 1024 * 1024;

export const decodeDataUrl = (dataUrl: unknown) => {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    throw new HttpError(400, "A valid image is required.");
  }
  const buffer = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
  if (buffer.byteLength > MAX_BYTES) throw new HttpError(413, "Image is too large (max 15 MB).");
  return buffer;
};

export async function uploadWebp(buffer: Buffer, profile: UploadProfile, name: string) {
  const { prefix, maxDimension, quality } = UPLOAD_PROFILES[profile];
  const body = await sharp(buffer)
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const key = `${prefix}/${name}.webp`;
  const Bucket = bucket();
  await s3.send(
    new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" })
  );
  return { url: `https://${Bucket}.s3.${region}.amazonaws.com/${key}`, key };
}

export const isManagedKey = (key: unknown): key is string =>
  typeof key === "string" &&
  !key.includes("..") &&
  Object.values(UPLOAD_PROFILES).some(({ prefix }) => key.startsWith(`${prefix}/`));

export const deleteObject = (key: string) => s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
