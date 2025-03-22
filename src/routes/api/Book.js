import express from 'express';
import bookController from '../../controllers/bookController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

// Base route
router.get('/', bookController.getBook);

// Other routes
router.post('/search', bookController.searchBook);
router.post('/add', verifyJWT, bookController.createBook);
router.delete('/:id', verifyJWT, bookController.deleteBook);
router.put('/:id', verifyJWT, bookController.updateBook);

export default router;
