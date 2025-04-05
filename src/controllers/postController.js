import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/bookSchema.js';
import Post from '../model/postSchema.js';
import User from '../model/userSchema.js';
import dotenv from 'dotenv';
import Flaged from '../model/FlagedSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const getPost = async (req, res) => {
  try {
    const result = await Post.find();
    if (result.length > 0) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'No posts found' });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// In your controller
const postComment = async (req, res) => {
  const { commentText } = req.body;
  const userId = req.user.id;
  const { postid } = req.params;

  try {
    // Validate input
    if (!commentText || typeof commentText !== 'string') {
      return res
        .status(400)
        .json({ message: 'Valid comment text is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(postid)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find user and post
    const [user, post] = await Promise.all([
      User.findById(userId),
      Post.findById(postid),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create and add comment
    const comment = {
      user: userId,
      text: commentText.trim(),
      created_at: new Date(),
    };

    post.comment.push(comment);
    await post.save();

    // Populate user info for the response
    const populatedPost = await Post.findById(postid).populate(
      'comment.user',
      'username profileImage'
    );

    const newComment = populatedPost.comment[populatedPost.comment.length - 1];

    return res.status(201).json({
      message: 'Comment added',
      comment: newComment,
    });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;
  try {
    const post = await Flaged.findById(commentId);
    if (!post) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    const deleteComment = await Flaged.findByIdAndDelete(commentId);

    // register flag to user Account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (typeof user.flaggedComments !== 'object') {
      user.flaggedComments = { amount: 0 };
    }
    if (isNaN(user.flaggedComments.amount)) {
      user.flaggedComments.amount = 0;
    }
    user.flaggedComments.amount += 1;
    await user.save();
    res.status(201).json({ message: 'User Flag record updated' });
    // here will add AI training to confirm the finding was correct
    return res
      .status(200)
      .json({ message: 'Comment deleted', data: deleteComment });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export default { getPost, postComment, deleteComment };
