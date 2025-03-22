import express from 'express';
import authController from '../controllers/AuthController.js';

const router = express.Router();

router.post('/register', authController.createUser);
router.post('/login', authController.login);
router.post('logout', authController.logout);

export default router;
