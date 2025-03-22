import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import { GoogleGenerativeAI } from "@google/generative-ai";


passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/protected/books/add",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email=$1", [
          profile.email,
        ]);

        let user;
        if (result.rows.length > 0) {
          // Existing user found
          user = result.rows[0];
          user.strategy = "google";
          user.picture = profile.photos[0]?.value || null;
        } else {
          // Create new user
          const newuser = await db.query(
            "INSERT INTO users (username, email, password, terms) VALUES ($1, $2, $3, $4) RETURNING *",
            [profile.given_name, profile.email, "google", "GT"]
          );

          if (newuser.rows.length > 0) {
            user = newuser.rows[0];
            user.strategy = "google";
            user.picture = profile.photos[0]?.value || null;
          } else {
            return cb(null, false, { message: "User creation failed" });
          }
        }

        return cb(null, user);
      } catch (err) {
        console.error(err);
        return cb(err);
      }
    }
  )
);


passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

