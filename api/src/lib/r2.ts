import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../config/env";

const config = {
  accessKeyId: env.R2_ACCESS_KEY_ID!,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  bucketName: env.R2_BUCKET_NAME!,
  endpoint: env.R2_UPLOAD_URL,
};

export const r2Client = new S3Client({
  region: "auto",
  endpoint: config.endpoint,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
});

export const r2BucketName = config.bucketName;

export const deleteFromR2 = async (key: string) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );
};
