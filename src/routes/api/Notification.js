import express from 'express';
import NotificationController from '../../controllers/NotificationController.js';

const router = express.Router();

router.get('/', NotificationController.getNotifications);

export default router;
