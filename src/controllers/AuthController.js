import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

dotenv.config();

const app = express();
const saltround = 10;

app.use(bodyParser.json());

//I don't know why the fuck i create this controll will get back to it
// const checkUserExists = async (req, res) => {
//   const { username, email } = req.query;

//   if (username) query.usename = username;
//   if (email) query.email = email;
//   try {
//     const userexists = await User.findOne(query);
//     if (userexists) res.status(400).json({ message: 'User already exists' });
//   } catch (e) {
//     res.status(500).json({ message: 'Error checking for user' });
//   }
// };

const createUser = async (req, res) => {
  try {
    const { username, firstname, lastname, email, phone, address, password } =
      req.body;
    console.log(req.body);

    // Check if the user already exists
    const userExists = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password - AWAIT IT HERE
    const hashedPassword = await bcrypt.hash(password, saltround);

    // Create a new user in the database
    const user = await User.create({
      username: username, // This was missing in your original code
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone,
      address: address,
      password: hashedPassword, // Use the awaited hashed password
    });

    console.log('User created ', user.toJSON());
    res.status(201).json({ message: 'User created successfully', user });
  } catch (e) {
    console.log('Error creating user ', e);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Check if the user exists
    const userExists = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!userExists) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(password, userExists.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Password does not match' });
    }

    // Check for JWT secrets
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      console.error('❌ Missing JWT secrets in environment variables!');
      return res
        .status(500)
        .json({ message: 'Server misconfiguration: Missing JWT secrets' });
    }

    // Generate JWT token
    const payload = {
      id: userExists.id, // Changed from _id to id since you're using Sequelize
      username: userExists.username,
      email: userExists.email,
      role: userExists.role,
    };

    // Generate JWT tokens
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });

    // Update user with refresh token
    userExists.refreshToken = refreshToken;
    await userExists.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // Send final response with access token
    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: userExists.id,
        username: userExists.username,
        email: userExists.email,
        role: userExists.role,
      },
      accessToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const logout = async (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });
  res.json({ message: 'Logout successful' });
};

export default { createUser, login, logout };
