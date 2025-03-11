import express from 'express';



const getBook= async (req, res) => {
  const bookName = "rich dad poor dad";

  // const response = await axios.get(
  //   `https://www.googleapis.com/books/v1/volumes?q=${bookName}&key=${GOOGLE_API}`
  // );
  // const results = response.data;
  // console.log(results.imageLinks.smallThumbnail);
  const books = await getbooks();

  const userphoto = req.user ? req.user.picture : null;

  res.render("pages/home", {
    books: books,
    user: req.user,
  });
};

const searchBook= async (req, res) => {
  const query = req.query.q; // Get search query from request
  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Query is required" });
  }

  try {
    // Perform a case-insensitive search for books by title or author
    const searchQuery = `
      SELECT book_title, book_author, book_comment, book_rating 
      FROM fav_list 
      WHERE LOWER(book_title) LIKE $1 OR LOWER(book_author) LIKE $1
    `;
    const results = await db.query(searchQuery, [`%${query.toLowerCase()}%`]);

    if (results.rowCount > 0) {
      res.status(200).json({ success: true, data: results.rows });
    } else {
      res.status(404).json({ success: false, message: "No books found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const createBook=async (req, res) => {
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
};


const deleteBook = (req, res) => {};

const updateBook = (req, res) => {};


export default {createBook,searchBook,getBook,deleteBook,updateBook} ;

