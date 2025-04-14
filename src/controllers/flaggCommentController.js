import express from 'express';
import Flaged from '../model/FlagedSchema.js';
import User from '../model/userSchema.js';
import Post from '../model/postSchema.js';
import Notification from '../model/notificationsSchema.js';
import logger from '../../utils/logger.js';

const getFlagedComment = async (req, res) => {
  try {
    const flaggedComment = await Flaged.find();

    console.log(flaggedComment);
    res.status(200).json(flaggedComment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteFlaggedComment = async (req, res) => {
  const { commentId } = req.params;

  try {
    const post = await Flaged.findById(commentId);
    if (!post) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = post.userId;
    const postid = post.postid;
    const deleteComment = await Flaged.findByIdAndDelete(commentId);

    // Register flag to user account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's flagged comments
    if (typeof user.flaggedComments !== 'object') {
      user.flaggedComments = { amount: 0 };
    }
    if (isNaN(user.flaggedComments.amount)) {
      user.flaggedComments.amount = 0;
    }
    user.flaggedComments.amount += 1;
    await user.save();

    // Create notification
    const notification = new Notification({
      userid: userId,
      type: 'moderator',
      category: 'flag',
      title: 'Comment violation has been found',
      message:
        'Your comment has been deleted by a moderator permanently as it violates the community guidelines',
      fromUserId: req.user.id,
      relatedResource: {
        type: 'post',
        id: postid,
      },
      createdAt: new Date(),
    });
    await notification.save();

    // Send single response with all data
    return res.status(200).json({
      message: 'Comment deleted and user flag record updated',
      data: deleteComment,
      notification: notification,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const moderatorRepost = async (req, res) => {
  const commentId = req.params.commentId;
  try {
    const flaggedComment = await Flaged.findById(commentId);
    if (!flaggedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    console.log(flaggedComment);
    const userId = flaggedComment.userId;
    const commentText = flaggedComment.comment;
    const createdAt = flaggedComment.created_at;

    console.log('flagged postid', flaggedComment.postid);

    //find for the post if exists

    const post = await Post.findById(flaggedComment.postid);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const comment = {
      user: userId,
      text: commentText.trim(),
      created_at: createdAt,
    };

    console.log('comment', comment);
    post.comment.push(comment);
    await post.save();

    const newstatus = 'false positive';
    flaggedComment.status = newstatus;
    await flaggedComment.save();

    //Notify user about the repost

    const notification = new Notification({
      userid: userId,
      type: 'moderator',
      category: 'flag',
      status: 'false positive',
      title: 'Comment violation not been found',
      message: `Your comment has been approved and posted by a moderator`,
      fromUserId: req.user.id,
      relatedResource: {
        type: 'post',
        id: flaggedComment.postid,
      },
      createdAt: new Date(),
    });
    await notification.save();

    res.status(201).json({
      message: 'Comment reposted',
      data: comment,
      'User Notification': notification,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default { getFlagedComment, deleteFlaggedComment, moderatorRepost };
