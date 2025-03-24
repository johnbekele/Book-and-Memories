import express from 'express';
import postController from '../../controllers/postController.js';
import verifyJWT from '../../middleware/verifyJWT.js';
import moderateComment from '../../middleware/moderateComment.js';

const router = express.Router();

router.post(
  '/comment/:postid',
  verifyJWT,
  moderateComment,

  postController.postComment
);
// router.get('/comment/moderate', verifyJWT, moderateComment.moderateComment);

export default router;
