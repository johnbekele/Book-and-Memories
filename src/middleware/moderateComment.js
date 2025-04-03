import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Flaged from '../model/FlagedSchema.js';
import logger from '../../utils/logger.js';
dotenv.config();

const gemini_API = process.env.GOOGLE_GEMINI_API;
const genAI = new GoogleGenerativeAI(gemini_API);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const moderateComment = async (req, res, next) => {
  const { commentText } = req.body;
  const userId = req.user.id;
  const formatedData = { user: userId, text: commentText };
  const formattedString = `User ID: ${formatedData.user}\nComment: "${formatedData.text}"`;
  const prompt = `Analyze the following data:\n${formattedString}\n\n flag if the comment is inappropriate give only this data the say Flagged first if flagged or not flag if not  then user id and the reason for the flagging .Separate them using a comma.`;

  // AI api integration tests
  try {
    const result = await model.generateContent(prompt);

    const AIresponse = result.response.candidates[0].content.parts;
    const textresponse = AIresponse[0].text
      .replace(/```json|```|\n/g, '')
      .trim()
      .split(',');
    const flagged = textresponse.includes('Flagged');
    logger.log(textresponse);
    if (flagged) {
      // save the flagged comment to the database
      try {
        const storeFlaggedComment = await Flaged.create({
          userId: userId,
          postid: req.params.postid,
          reason: textresponse[2],
          comment: commentText,
        });
        logger.log(storeFlaggedComment);
        return res.status(200).json({
          message:
            'Comment flagged will not be posted for public .Please wait for moderatore response',
        });
      } catch (error) {
        logger.error(error);
        return res
          .status(500)
          .json({ success: false, message: 'error sedding flaged Comment ' });
      }

      //   return res.status(200).json({ AIresponse });
    }
    next();
  } catch (error) {
    logger.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Error generating AI response' });
  }
};

export default moderateComment;
