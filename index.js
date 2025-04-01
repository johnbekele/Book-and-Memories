// import express from "express";
// import bodyParser from "body-parser";
// import pg from "pg";
// import dotenv from "dotenv";
// import axios from "axios";
// import bcrypt from "bcrypt";
// import session from "express-session";

// dotenv.config();
// // const BASE_URL =
// //   "https://generativeai.googleapis.com/v1beta3/models/gemini-1.5-flash:generateText";
// // const { GoogleGenerativeAI } = require("@google/generative-ai");

// const port = process.env.PORT || 8080;
// const app = express();

// //middleware configuration
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));
// app.set("view engine", "ejs");

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       maxAge: 60000 * 24 * 7, // 7 days
//       secure: false,
//     },
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

// const db = new pg.Client({
//   user: "postgres",
//   host: "localhost",
//   database: "books",
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });
// db.connect();

// //Join query to database fetching posted books with user data
// async function getbooks() {
//   const result = await db.query(
//     "SELECT * FROM fav_list INNER JOIN users ON fav_list.user_id = users.id;"
//   );
//   let Books = [];

//   result.rows.forEach((book) => {
//     Books.push(book);
//   });
//   return Books;
// }

// //middleware to check user Authentication
// function AuthUser(req, res, next) {
//   if (
//     req.isAuthenticated() &&
//     (req.user.strategy === "local" || req.user.strategy === "google")
//   ) {
//     return next();
//   } else {
//     res.redirect("/login");
//   }
// }

// //middleware to protected routes

// app.use("/protected", AuthUser);

// app.get("/", async (req, res) => {
//   const bookName = "rich dad poor dad";

//   // const response = await axios.get(
//   //   `https://www.googleapis.com/books/v1/volumes?q=${bookName}&key=${GOOGLE_API}`
//   // );
//   // const results = response.data;
//   // console.log(results.imageLinks.smallThumbnail);
//   const books = await getbooks();

//   const userphoto = req.user ? req.user.picture : null;

//   res.render("pages/home", {
//     books: books,
//     user: req.user,
//   });
// });

// //search books route
// // Search books route
// app.get("/search", async (req, res) => {
//   const query = req.query.q; // Get search query from request
//   if (!query) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Query is required" });
//   }

//   try {
//     // Perform a case-insensitive search for books by title or author
//     const searchQuery = `
//       SELECT book_title, book_author, book_comment, book_rating
//       FROM fav_list
//       WHERE LOWER(book_title) LIKE $1 OR LOWER(book_author) LIKE $1
//     `;
//     const results = await db.query(searchQuery, [`%${query.toLowerCase()}%`]);

//     if (results.rowCount > 0) {
//       res.status(200).json({ success: true, data: results.rows });
//     } else {
//       res.status(404).json({ success: false, message: "No books found" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

// // AUth local route
// app.get("/login", (req, res) => {
//   res.render("pages/auth/login", { message: null });
// });

// app.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/protected/books/add",
//     failureRedirect: "/login",
//   })
// );

// app.get("/register", (req, res) => {
//   res.render("pages/auth/register", { message: null });
// });

// app.post("/register", async (req, res) => {
//   const { username, email, password, terms } = req.body;
//   const query =
//     "INSERT INTO users (username, email, password , terms) VALUES ($1, $2, $3, $4) RETURNING *;";
//   try {
//     const results = await db.query("SELECT email FROM users WHERE email=$1 ", [
//       email,
//     ]);

//     if (results.rows.length > 0) {
//       res.render("pages/auth/register", {
//         message: "email alredy used please log in  ",
//       });
//     } else {
//       bcrypt.hash(password, saltRounds, async (err, hash) => {
//         if (err) {
//           console.error(err);
//           res.render("pages/auth/register", {
//             message:
//               "An error occurred while processing your request. Please try again.",
//           });
//         } else {
//           console.log(hash);

//           const result = await db.query(query, [username, email, hash, terms]);

//           if (result.rowCount > 0) {
//             res.render("pages/auth/login", {
//               message: "registeration succesfull log in to your account ",
//             });
//           } else {
//             res.render("pages/auth/register", {
//               message: "registration faild",
//             });
//           }
//         }
//       });
//     }
//   } catch (err) {
//     console.error(err);
//   }
// });

// //Auth google route

// app.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   })
// );

// app.get(
//   "/auth/google/protected/books/add",
//   passport.authenticate("google", {
//     successRedirect: "/protected/books/add",
//     failureRedirect: "/login",
//   })
// );

// //log out

// app.get("/logout", (req, res) => {
//   req.logout((err) => {
//     if (err) console.log(err);
//     res.redirect("/");
//   });
// });

// //bookStore routes
// app.get("/protected/books/add", (req, res) => {
//   console.log(req.newuser);
//   res.render("pages/books/add-book");
// });

// app.post("/protected/books/add", async (req, res) => {
//   const userId = req.user.id;
//   const bookId = 101; //will be updated by the API ID
//   const {
//     bookTitle,
//     author,
//     startDate,
//     endDate,
//     favoritePoints,
//     memories,
//     rating,
//   } = req.body;
//   const query = `
//     INSERT INTO fav_list (book_title, book_author, start_date, end_date, book_comment, book_memories, book_rating, book_id, user_id)
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//     RETURNING *;
//   `;
//   try {
//     const result = await db.query(query, [
//       bookTitle,
//       author,
//       startDate,
//       endDate,
//       favoritePoints,
//       memories,
//       rating,
//       bookId,
//       userId,
//     ]);

//     if (result.rowCount > 0) {
//       res.status(201).json({ success: true, data: result.rows[0] });
//       res.render("pages/books/add-book", {
//         message: "book added successfully",
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error adding favorite" });
//   }
// });

// //Ai integration

// app.get("/ai", async (req, res) => {
//   const data = await getbooks();
//   const formatedData = data
//     .map(
//       (book) => `
//  id:${book.id} ,
//  name:${book.bookTitle},
//  author:${book.bookAuthor},
//  comment:${book.book_comment},
//  rating:${book.book_rating} `
//     )
//     .join("\n");
//   const prompt = `Analyze the following data:\n${formatedData}\n\n and give the best fiction book with good rating  `;

//   // AI api integration tests
//   try {
//     const result = await model.generateContent(prompt);

//     const AIresponse = result.response.candidates[0].output;

//     console.log(AIresponse);
//     res.status(200).json({ success: true, message: AIresponse });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error generating AI response" });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port http://localhost:${port}`);
// });
