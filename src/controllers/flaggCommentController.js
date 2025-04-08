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

export default { getFlagedComment };
