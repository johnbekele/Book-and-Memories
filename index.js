import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const port = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const mockBooks = [
  {
    _id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    favoritePoints:
      "The lavish parties and the mysterious character of Gatsby really drew me in. The way the author describes the roaring twenties and the symbolism of the green light made this book unforgettable.",
    user: {
      username: "bookworm123",
    },
  },
  {
    _id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    favoritePoints:
      "Scout's innocent perspective on serious issues and Atticus's unwavering moral compass made this book powerful. The courtroom scenes were particularly moving.",
    user: {
      username: "readerlover",
    },
  },
  {
    _id: "3",
    title: "1984",
    author: "George Orwell",
    favoritePoints:
      "The dystopian world building is incredible. The concept of doublethink and the way language is used to control thought really made me think about our own society.",
    user: {
      username: "dystopia_fan",
    },
  },
  {
    _id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    favoritePoints:
      "The witty dialogue between Elizabeth and Mr. Darcy is timeless. I love how the story explores themes of pride, prejudice, and social class while maintaining its charm.",
    user: {
      username: "classic_reader",
    },
  },
];

app.get("/", (req, res) => {
  res.render("pages/home", {
    books: mockBooks,
  });
});
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "pass123",
  port: 5432,
});
db.connect();

app.get("/", async (req, res) => {
  const results = await axios.get("https://covers.openlibrary.org");

  console.log(results);
  res.render("pages/home");
});

app.get("/login", (req, res) => {
  res.render("pages/auth/login");
});

app.get("/register", (req, res) => {
  res.render("pages/auth/register");
});

app.get("/books/add", (req, res) => {
  res.render("pages/books/add-book");
});

app.post("/books/add", (req, res) => {
  console.log(req.body);
  res.send("Book added successfully");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
