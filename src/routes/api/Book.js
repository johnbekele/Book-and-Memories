import express from 'express';
import bookController from '../../controllers/bookController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

// Base route
router.get('/', bookController.getBook);

// Other routes
router.post('/search', bookController.searchBook);
router.post('/add', verifyJWT, bookController.createBook);
router.delete('/delete/:id', verifyJWT, bookController.deleteBook);
router.put('/update/:id', verifyJWT, bookController.updateBook);

//Google Book API routes

router.get('/google/search', bookController.searchGoogleBooks);
router.get('/google/:googleId', bookController.getGoogleBookDetails);

export default router;
