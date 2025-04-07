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

router.post('/:postId/like', verifyJWT, postController.likePost);
router.post('/:postId/unlike', verifyJWT, postController.unlikePost);

export default router;
