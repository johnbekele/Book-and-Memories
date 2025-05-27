
---

# Book and Memories

**Book and Memories** is an app where people can share their experiences with books, discover new reads, and connect with others who share similar interests. Users can sign in with Google Auth or Local Strategy, and the app is designed to store and display their book reviews and experiences.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Authentication](#authentication)
- [Features](#features)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

![Screenshot 2025-05-27 125830](https://github.com/user-attachments/assets/f1a017f3-41a0-48e1-b932-8d959cf559f4)

![Screenshot 2025-05-27 125559](https://github.com/user-attachments/assets/1a1210b6-0064-49e3-8b44-29bbfec2db61)
![Screenshot 2025-05-27 125942](https://github.com/user-attachments/assets/c3661cd6-1c39-4f26-b93c-fa8b52c53055)
![Screenshot 2025-05-27 130001](https://github.com/user-attachments/assets/30992dd5-bf4b-43b8-b53e-dcec62b1eb48)

## Technologies Used

- **PostgreSQL**: Relational database for storing user data and book experiences.
- **Node.js**: JavaScript runtime for backend development.
- **Express.js**: Web application framework for Node.js.
- **EJS**: Templating engine for rendering HTML views.
- **Passport.js**: Authentication middleware for Google Auth and Local Strategy.
- **bcrypt**: For hashing and verifying passwords.
- **Sequelize**: ORM for interacting with PostgreSQL.
- **AI**: AI-based book suggestions (coming soon).

## Project Structure

```
book-and-memories/
├── config/              # Configuration files (passport.js, environment variables)
│   └── passport.js      # Passport configuration for authentication
├── controllers/         # Logic for handling routes and responses
│   └── bookController.js
│   └── userController.js
├── models/              # Sequelize models for database interactions
│   └── book.js
│   └── user.js
├── routes/              # Express routes for app endpoints
│   └── bookRoutes.js
│   └── userRoutes.js
├── views/               # EJS view templates
│   └── index.ejs        # Home page template
│   └── login.ejs        # Login page template
│   └── dashboard.ejs    # Dashboard for user reviews and experiences
├── .env                 # Environment variables (database connection, secret keys)
├── app.js               # Main Express server file
└── package.json         # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js and npm should be installed. If you don't have them installed, download and install them from [Node.js official website](https://nodejs.org/).
- PostgreSQL should be installed. Follow the instructions on [PostgreSQL's website](https://www.postgresql.org/download/) to install it.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/book-and-memories.git
   cd book-and-memories
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   - Create a PostgreSQL database (e.g., `book_and_memories`).
   - Set up a `.env` file in the root directory of the project with the following variables:
     ```
     DB_HOST=localhost
     DB_USER=your_db_user
     DB_PASSWORD=your_db_password
     DB_NAME=book_and_memories
     SESSION_SECRET=your_session_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     CALLBACK_URL=http://localhost:3000/auth/google/callback
     ```

4. **Run migrations** (if you're using Sequelize for models):
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Start the server**:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3000`.

## Authentication

**Book and Memories** supports two authentication strategies:

- **Google Authentication**: Users can log in using their Google account via Passport's Google strategy.
- **Local Authentication**: Users can create an account with their email and password, which are stored securely in the PostgreSQL database.

### Authentication Flow:
1. **Google Authentication**: 
   - Users are redirected to Google login when they click the "Login with Google" button.
   - After successful authentication, they are redirected to their dashboard.

2. **Local Authentication**: 
   - Users can register with an email and password.
   - On login, the password is verified, and users are redirected to their dashboard.

## Features

- **Book Reviews**: Users can share their experiences with books they've read.
- **Dashboard**: After logging in, users can view their submitted reviews and manage their book collection.
- **Authentication**: Google Auth and Local Strategy are available for secure login and registration.
- **AI Suggestions (Coming Soon)**: An AI feature will suggest books based on the user's reading history and preferences.

## Usage

1. **Create an Account**: Choose either Google Auth or Local Authentication to sign up.
2. **Search for Books**: Use the book search functionality to find books.
3. **Write Reviews**: Share your thoughts and experiences with books you've read.
4. **View AI Suggestions**: (Coming soon) The AI will suggest books based on your preferences.

## Contributing

Feel free to fork the repository, make changes, and open a pull request. Contributions are welcome!

To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Create a new pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

