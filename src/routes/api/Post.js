import express from 'express';
import postController from '../../controllers/postController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.post('/comment/:postid', verifyJWT, postController.postComment);

export default router;
