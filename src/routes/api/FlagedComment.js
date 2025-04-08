import express from 'express';
import flaggCommentController from '../../controllers/flaggCommentController.js';

const router = express.Router();

router.get('/', flaggCommentController.getFlagedComment);

export default router;
