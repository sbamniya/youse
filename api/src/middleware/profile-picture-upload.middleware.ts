import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { deleteFromR2, r2BucketName, r2Client } from "../lib/r2";
import { AppError } from "../utils/app-error";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const upload = multer({
  storage: multerS3({
    s3: r2Client,
    bucket: r2BucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: "public, max-age=31536000, immutable",
    key: (req, file, callback) => {
      const extension = extensionByMimeType[file.mimetype];
      if (!req.user || !extension) {
        callback(new AppError(400, "Invalid profile picture upload"));
        return;
      }
      callback(
        null,
        `profile-pictures/${req.user.id}/${randomUUID()}.${extension}`,
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      callback(new AppError(415, "Only JPEG, PNG, and WebP images are supported"));
      return;
    }
    callback(null, true);
  },
}).single("profilePicture");

export const uploadProfilePicture: RequestHandler = (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    const file = req.file as Express.MulterS3.File | undefined;
    if (!file || allowedImageTypes.has(file.contentType)) {
      next();
      return;
    }

    // AUTO_CONTENT_TYPE checks the stream's first bytes. Remove objects whose
    // detected content is not an allowed image before rejecting the request.
    void deleteFromR2(file.key)
      .catch(() => undefined)
      .finally(() =>
        next(new AppError(415, "Only JPEG, PNG, and WebP images are supported")),
      );
  });
};
