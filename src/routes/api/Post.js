import express from 'express';
import postController from '../../controllers/postController.js';
import verifyJWT from '../../middleware/verifyJWT.js';
import moderateComment from '../../middleware/moderateComment.js';
import { isAdmin, isModerator } from '../../middleware/verifyRole.js';

const router = express.Router();

router.get('/', postController.getPost);
router.post(
  '/comment/:postid',
  verifyJWT,
  moderateComment,

  postController.postComment
);
router.delete(
  '/comment/:commentId',
  verifyJWT,

  postController.deleteComment
);
// router.get('/comment/moderate', verifyJWT, moderateComment.moderateComment);

export default router;
