import express from 'express';
import uploadController from '../../controllers/uploadController.js';
import upload from '../../config/multerConfig.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.post(
  '/avatar',
  verifyJWT,
  upload.single('profilePic'),
  uploadController.uploadAvatar
);

export default router;
