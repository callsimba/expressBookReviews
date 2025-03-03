const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (users[username]) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users[username] = { password };
    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book list using Promises
public_users.get('/promise-books', (req, res) => {
    new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books available");
        }
    })
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(500).json({ message: error }));
});

// Get book list using Async-Await with Axios
public_users.get('/async-books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Get book details based on ISBN (Original)
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]); 
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on Author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksByAuthor = [];

    for (let key in books) {
        if (books[key].author === author) {
            booksByAuthor.push({ isbn: key, ...books[key] });
        }
    }

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get book details based on Title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let booksByTitle = []; 

    for (let key in books) {
        if (books[key].title === title) {
            booksByTitle.push({ isbn: key, ...books[key] });
        }
    }

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book details based on Title using Promises
public_users.get('/promise-title/:title', (req, res) => {
    const title = req.params.title;

    new Promise((resolve, reject) => {
        let booksByTitle = [];
        for (let key in books) {
            if (books[key].title === title) {
                booksByTitle.push({ isbn: key, ...books[key] });
            }
        }

        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject("No books found with this title");
        }
    })
    .then((data) => res.status(200).json(data))
    .catch((error) => res.status(404).json({ message: error }));
});

// Get book details based on Title using Async-Await with Axios
public_users.get('/async-title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; 

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
