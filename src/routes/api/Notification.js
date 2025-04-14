import express from 'express';
import NotificationController from '../../controllers/NotificationController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.get('/', NotificationController.getNotifications);
router.get('/user', verifyJWT, NotificationController.getMyNotifications);
export default router;
