import express from 'express';
import Flaged from '../model/FlagedSchema.js';

const getFlagedComment = async (req, res) => {
  try {
    const flagedComments = await Flaged.find();

    console.log(flagedComments);
    res.status(200).json(flagedComments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
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

export default { getFlagedComment, deleteComment };
