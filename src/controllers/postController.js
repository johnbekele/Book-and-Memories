import express from 'express';
import bodyParser from 'body-parser';
import Book from '../model/bookSchema.js';
import Post from '../model/postSchema.js';
import User from '../model/userSchema.js';
import dotenv from 'dotenv';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const postComment = async (req, res) => {
  const { commentText } = req.body;
  const userId = req.user.id;
  const { postid } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const post = await Post.findById(postid);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: userId,
      text: commentText,
      created_at: new Date(),
    };

    post.comment.push(comment);
    await post.save();

    return res.status(201).json({ message: 'Comment added' });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};

export default { postComment };
