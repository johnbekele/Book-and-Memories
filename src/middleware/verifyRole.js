import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const isAdmin = async (req, res, next) => {
  const user = req.user.role;

  if (!user) {
    return res.status(403).json({ message: 'Access Denied' });
  }
  try {
    if (user.role.Admin >= 3001) {
      next();
      req.Admin = user.role.Admin;
    } else {
      return res.status(403).json({
        message: 'Access Denied you need Admin access to access this resource',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

const isModerator = async (req, res, next) => {
  const user = req.user.role;
  if (!user) {
    return res.status(403).json({ message: 'Access Denied' });
  }
  try {
    if (user.role.Moderator >= 4001) {
      next();
      req.Moderator = user.role.Moderator;
    } else {
      return res.status(403).json({
        message:
          'Access Denied you need Moderator access to access this resource',
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default { isAdmin, isModerator };
