import express from 'express';
import favoritesController from '../../controllers/favoritesController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.get('/', verifyJWT, favoritesController.getFavorites);
router.post('/:postId', verifyJWT, favoritesController.addFavorite);

export default router;
