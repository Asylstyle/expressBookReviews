const express = require('express');
const axios = require('axios');
const books = require('./booksdb');
const { users, isValid } = require('./auth_users');
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (isValid(username)) return res.status(409).json({ message: 'User already exists' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered' });
});

public_users.get('/', (req, res) => res.json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});
for (const field of ['author', 'title']) {
  public_users.get(`/${field}/:${field}`, (req, res) => {
    const matches = Object.fromEntries(Object.entries(books).filter(
      ([, book]) => book[field].toLowerCase() === req.params[field].toLowerCase()
    ));
    return Object.keys(matches).length ? res.json(matches) : res.status(404).json({ message: 'Book not found' });
  });
}
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

// Axios client functions for the four asynchronous retrieval tasks.
// Each function returns the parsed JSON data and propagates request failures.
const api = axios.create({ baseURL: process.env.BOOK_API_URL || 'http://localhost:5000', timeout: 5000 });
async function getAllBooks() {
  const response = await api.get('/');
  return response.data;
}
async function getBooksByISBN(isbn) {
  const response = await api.get(`/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
}
async function getBooksByAuthor(author) {
  const response = await api.get(`/author/${encodeURIComponent(author)}`);
  return response.data;
}
async function getBooksByTitle(title) {
  const response = await api.get(`/title/${encodeURIComponent(title)}`);
  return response.data;
}
module.exports = { general: public_users, getAllBooks, getBooksByISBN, getBooksByAuthor, getBooksByTitle };
