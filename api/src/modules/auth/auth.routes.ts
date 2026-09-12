import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth.middleware';
import { uploadProfilePicture } from '../../middleware/profile-picture-upload.middleware';
import { refreshSchema, requestOtpSchema, updateProfileSchema, verifyOtpSchema } from './auth.schema';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/otp/request', validate(requestOtpSchema), authController.requestOtp);
authRouter.post('/otp/verify', validate(verifyOtpSchema), authController.verifyOtp);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', validate(refreshSchema), authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.patch('/me', requireAuth, validate(updateProfileSchema), authController.updateProfile);
authRouter.put(
  '/me/profile-picture',
  requireAuth,
  uploadProfilePicture,
  authController.updateProfilePicture,
);
