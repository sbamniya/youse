import { Router } from 'express';
import multer from 'multer';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth.middleware';
import { AppError } from '../../utils/app-error';
import { refreshSchema, requestOtpSchema, updateProfileSchema, verifyOtpSchema } from './auth.schema';
import * as authController from './auth.controller';

export const authRouter = Router();

const profilePictureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      callback(new AppError(415, 'Only JPEG, PNG, and WebP images are supported'));
      return;
    }
    callback(null, true);
  },
});

authRouter.post('/otp/request', validate(requestOtpSchema), authController.requestOtp);
authRouter.post('/otp/verify', validate(verifyOtpSchema), authController.verifyOtp);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', validate(refreshSchema), authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.patch('/me', requireAuth, validate(updateProfileSchema), authController.updateProfile);
authRouter.put(
  '/me/profile-picture',
  requireAuth,
  profilePictureUpload.single('profilePicture'),
  authController.updateProfilePicture,
);
