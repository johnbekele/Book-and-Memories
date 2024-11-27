-- create tabel for favorite

CREATE TABLE fav_list (
    id SERIAL PRIMARY KEY NOT NULL,
    book_title VARCHAR(50),
	book_author VARCHAR(100),
    start_date DATE ,
	end_date DATE ,
    book_comment TEXT,
    book_memories TEXT,
	book_rating INTEGER,
    book_id INTEGER,
    user_id INTEGER REFERENCES users(id)
);


SELECT * FROM users WHERE email=$1 

INSERT INTO users (username ,email,password ,terms)
VALUES ($1 ,$2,$3)