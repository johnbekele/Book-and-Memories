import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/bookSchema.js';
import Post from '../model/postSchema.js';
import User from '../model/userSchema.js';
import dotenv from 'dotenv';
import Flaged from '../model/FlagedSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';
import Favorite from '../model/favoritesSchema.js';

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

//user can delete their own comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    // First find the post containing the comment
    const post = await Post.findOne(
      { 'comment._id': commentId },
      { 'comment.$': 1 }
    );

    // Check if post exists and has comments
    if (!post || !post.comment || post.comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comment[0];

    // Check if user is authorized to delete this comment
    if (comment.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this comment' });
    }

    // Remove the comment using updateOne with $pull
    const result = await Post.updateOne(
      { 'comment._id': commentId },
      { $pull: { comment: { _id: commentId } } }
    );

    if (result.modifiedCount > 0) {
      return res.status(200).json({
        message: 'Comment deleted successfully',
      });
    } else {
      return res
        .status(404)
        .json({ message: 'Comment not found or already deleted' });
    }
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id; // Assuming req.user is set by auth middleware
    console.log('userId', userId);
    console.log('postId', postId);
    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    // Add user to likes array
    await Post.findByIdAndUpdate(
      postId,
      { $push: { likes: userId } },
      { new: true }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // Validate post ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user hasn't liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post not liked yet' });
    }

    // Remove user from likes array
    await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const favorite = async (req, res) => {
  const { bookid } = req.params;
  const userId = req.user.id;

  try {
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookid)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    // Find user and book
    const [user, book] = await Promise.all([
      User.findById(userId),
      Book.findById(bookid),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Create and add favorite
    const favorite = {
      user: userId,
      book: bookid,
      created_at: new Date(),
    };

    user.favorites.push(favorite);
    await user.save();

    return res.status(201).json({
      message: 'Book added to favorites',
      favorite,
    });
  } catch (error) {
    logger.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export default { getPost, postComment, deleteComment, likePost, unlikePost };
