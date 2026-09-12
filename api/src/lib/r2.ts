import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const config = {
  accessKeyId: env.R2_ACCESS_KEY_ID!,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  bucketName: env.R2_BUCKET_NAME!,
  endpoint: env.R2_UPLOAD_URL,
};

const r2Client = new S3Client({
  region: "auto",
  endpoint: config.endpoint,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

export const uploadToR2 = async (input: {
  key: string;
  body: Buffer;
  contentType: string;
}) => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return input.key;
};
