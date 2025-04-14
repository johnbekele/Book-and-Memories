import logger from '../../utils/logger.js';
import express from 'express';
import Notification from '../model/notificationsSchema.js';
import mongoose from 'mongoose';

const getNotifications = async (req, res) => {
  try {
    const response = await Notification.find();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: 'faild requeste ' });
  }
};

const getMyNotifications = async (req, res) => {
  const userId = req.params.userId;
  try {
    const notifications = await Notification.find({ userid: userId });
    if (!notifications) {
      return res.status(404).json({ message: 'No notifications found' });
    }
    res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const accessNotification = async (req, res) => {
  const notificationId = req.params.notificationId;
  try {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getNotifications, accessNotification, getMyNotifications };
