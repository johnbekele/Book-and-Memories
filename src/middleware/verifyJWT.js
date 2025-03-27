import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid token', authHeader });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Check if decoded contains the expected user data
    if (!decoded || !decoded.id) {
      console.error('Invalid token payload:', decoded);
      return res.status(403).json({ error: 'Invalid token structure' });
    }

    // Set the user object directly from decoded data
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      fistname: decoded.firstname,
      lastname: decoded.lastname,
      phone: decoded.phone,
      address: decoded.address,
    };

    console.log('Verified user:', req.user); // Debug log
    next();
  } catch (err) {
    console.error('JWT Verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export default verifyJWT;
