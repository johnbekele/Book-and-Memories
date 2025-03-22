import express from 'express';
import bookController from '../../controllers/bookController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router
  .route('/', bookController.getBook)
  .post('/search/id', bookController.searchBook)
  .post('/add', verifyJWT, bookController.createBook)
  .delete('/:id', verifyJWT, bookController.deleteBook)
  .put('/:id', verifyJWT, bookController.updateBook);

export default router;
