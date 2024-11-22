import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

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
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

//middleware to protected routes

app.use("/protected", AuthUser);

app.get("/", async (req, res) => {
  const books = await getbooks();
  res.render("pages/home", {
    books: books,
    username: req.user ? req.user.username : null,
  });
});

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

app.get("/protected/books/add", (req, res) => {
  console.log(req.user);
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

passport.use(
  new Strategy(async function (username, password, cb) {
    const query = "SELECT * FROM users WHERE email = $1";
    console.log(username);
    try {
      const result = await db.query(query, [username]);

      if (result.rows.length > 0) {
        const hashPasswor = result.rows[0].password;
        const user = result.rows[0];

        console.log(user);
        // compaire bycypt
        const isMatch = await bcrypt.compare(password, hashPasswor);

        if (isMatch) {
          return cb(null, user);
        } else {
          return cb("invalid password,false");
        }
      }
    } catch (err) {
      console.error(err);
      return cb("user can't be found please re enter ");
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
