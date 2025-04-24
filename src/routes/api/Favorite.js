import express from 'express';
import favoritesController from '../../controllers/favoritesController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.get('/', verifyJWT, favoritesController.getFavorites);
router.post('/add/:postId', verifyJWT, favoritesController.addFavorite);
router.delete('/delete/:favId', verifyJWT, favoritesController.removefavorites);

export default router;
