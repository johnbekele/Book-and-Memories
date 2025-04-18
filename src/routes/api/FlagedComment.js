import express from 'express';
import flaggCommentController from '../../controllers/flaggCommentController.js';
import { isAdmin, isModerator } from '../../middleware/verifyRole.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.get(
  '/',
  // verifyJWT,
  // isModerator,

  flaggCommentController.getFlagedComment
);

router.post(
  '/repost/:commentId',
  verifyJWT,
  isModerator,
  flaggCommentController.moderatorRepost
);

router.delete(
  '/delete/:commentId',
  verifyJWT,
  isModerator,
  flaggCommentController.deleteFlaggedComment
);
export default router;
