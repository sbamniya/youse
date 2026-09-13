import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { uploadImage } from '../../middleware/image-upload.middleware';
import * as controller from './upload.controller';

export const uploadRouter = Router();
uploadRouter.use(requireAuth);

uploadRouter.post('/images', uploadImage, controller.createImage);
