import User from '../model/userSchema.js';
import Favorites from '../model/favoritesSchema.js';
import Post from '../model/postSchema.js';
import logger from '../../utils/logger.js';
import mongoose from 'mongoose';

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('userId', userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const favorites = await Favorites.find({ userid: userId });
    if (!favorites) {
      return res.status(404).json({ message: 'No favorites found' });
    }

    res.status(200).json(favorites);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const removefavorites = async (req, res) => {
  const { favId } = req.params;
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "user doesn't exist " });
    }

    // update favorites
    const favexist = await Favorites.findOne({ userId, favId });

    if (!favexist) {
      res.status(404).json({ message: "favoriutes doesn't exist" });
    }

    const deleteFav = await Favorites.findOneAndDelete({ _id: favId });

    res.status(202).json('dleted favorite', favexist);
  } catch (error) {
    res.status(404).json('error response', error);
    console.log(error);
  }
};

const addFavorite = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    console.log('userId', userId);
    console.log('postId', postId);

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const bookId = post.book;
    const exitintgFavorite = await Favorites.findOne({ userId, postId });
    if (exitintgFavorite) {
      return res.status(409).json({ message: 'Post already favorited' });
    }

    const favorited = new Favorites({
      userid: userId,
      postid: postId,
      bookid: bookId,
    });
    await favorited.save();
    res.status(201).json({ message: 'Post favorited successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default { getFavorites, addFavorite, removefavorites };
