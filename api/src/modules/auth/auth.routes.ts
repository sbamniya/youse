import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth.middleware';
import { uploadProfilePicture } from '../../middleware/image-upload.middleware';
import { rateLimit } from '../../middleware/rate-limit.middleware';
import { refreshSchema, registerPushTokenSchema, requestOtpSchema, updateProfileSchema, verifyOtpSchema } from './auth.schema';
import * as authController from './auth.controller';

export const authRouter = Router();

const requestOtpRateLimit = rateLimit({
  keyPrefix: 'otp-request',
  points: 2,
  durationSeconds: 30,
  keyGenerator: (req) => req.body.phone,
});

authRouter.post(
  '/otp/request',
  validate(requestOtpSchema),
  requestOtpRateLimit,
  authController.requestOtp,
);
authRouter.post('/otp/verify', validate(verifyOtpSchema), authController.verifyOtp);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', validate(refreshSchema), authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.put('/push-token', requireAuth, validate(registerPushTokenSchema), authController.registerPushToken);
authRouter.put(
  '/me',
  requireAuth,
  validate(updateProfileSchema),
  authController.updateProfile,
);
authRouter.patch('/me', requireAuth, validate(updateProfileSchema), authController.updateProfile);
authRouter.put(
  '/me/profile-picture',
  requireAuth,
  uploadProfilePicture,
  authController.updateProfilePicture,
);
