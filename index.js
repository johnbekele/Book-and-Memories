import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";

dotenv.config();

const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const saltRounds = 10;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 60000 * 24 * 7, // 7 days
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

//Join query to database fetching posted books with user data
async function getbooks() {
  const result = await db.query(
    "SELECT * FROM fav_list INNER JOIN users ON fav_list.user_id = users.id;"
  );
  let Books = [];

  result.rows.forEach((book) => {
    Books.push(book);
  });
  return Books;
}

//middleware to check user Authentication
function AuthUser(req, res, next) {
  if (
    req.isAuthenticated() &&
    (req.user.strategy === "local" || req.user.strategy === "google")
  ) {
    return next();
  } else {
    res.redirect("/login");
  }
}

//middleware to protected routes

app.use("/protected", AuthUser);

app.get("/", async (req, res) => {
  const books = await getbooks();
  const userphoto = req.user ? req.user.picture : null;

  res.render("pages/home", {
    books: books,
    user: req.user,
  });
});

// AUth local route
app.get("/login", (req, res) => {
  res.render("pages/auth/login", { message: null });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/protected/books/add",
    failureRedirect: "/login",
  })
);

app.get("/register", (req, res) => {
  res.render("pages/auth/register", { message: null });
});

app.post("/register", async (req, res) => {
  const { username, email, password, terms } = req.body;
  const query =
    "INSERT INTO users (username, email, password , terms) VALUES ($1, $2, $3, $4) RETURNING *;";
  try {
    const results = await db.query("SELECT email FROM users WHERE email=$1 ", [
      email,
    ]);

    if (results.rows.length > 0) {
      res.render("pages/auth/register", {
        message: "email alredy used please log in  ",
      });
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error(err);
          res.render("pages/auth/register", {
            message:
              "An error occurred while processing your request. Please try again.",
          });
        } else {
          console.log(hash);

          const result = await db.query(query, [username, email, hash, terms]);

          if (result.rowCount > 0) {
            res.render("pages/auth/login", {
              message: "registeration succesfull log in to your account ",
            });
          } else {
            res.render("pages/auth/register", {
              message: "registration faild",
            });
          }
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
});

//Auth google route

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/protected/books/add",
  passport.authenticate("google", {
    successRedirect: "/protected/books/add",
    failureRedirect: "/login",
  })
);

//log out

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

//bookStore routes
app.get("/protected/books/add", (req, res) => {
  console.log(req.newuser);
  res.render("pages/books/add-book");
});

app.post("/protected/books/add", async (req, res) => {
  const userId = req.user.id;
  const bookId = 101; //will be updated by the API ID
  const {
    bookTitle,
    author,
    startDate,
    endDate,
    favoritePoints,
    memories,
    rating,
  } = req.body;
  const query = `
    INSERT INTO fav_list (book_title, book_author, start_date, end_date, book_comment, book_memories, book_rating, book_id, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  try {
    const result = await db.query(query, [
      bookTitle,
      author,
      startDate,
      endDate,
      favoritePoints,
      memories,
      rating,
      bookId,
      userId,
    ]);

    if (result.rowCount > 0) {
      res.status(201).json({ success: true, data: result.rows[0] });
      res.render("pages/books/add-book", {
        message: "book added successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding favorite" });
  }
});

//Auth Strategy for local

passport.use(
  "local",
  new Strategy(async function (username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const hashPassword = user.password;

        const isMatch = await bcrypt.compare(password, hashPassword);

        if (isMatch) {
          user.strategy = "local"; // Assign strategy
          return cb(null, user);
        } else {
          return cb(null, false, { message: "Invalid password" });
        }
      } else {
        return cb(null, false, { message: "User not found" });
      }
    } catch (err) {
      console.error(err);
      return cb(err);
    }
  })
);

//Auth strategies for Google

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

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
