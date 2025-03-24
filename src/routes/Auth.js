import express from 'express';
import authController from '../controllers/AuthController.js';

const router = express.Router();

router.get('/users', authController.users);
router.post('/register', authController.createUser);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/escalate/:id', authController.escalateUser);

export default router;
