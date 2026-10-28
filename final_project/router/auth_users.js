const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb');
const regd_users = express.Router();
const users = [];
const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);

regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password' });
  const token = jwt.sign({ username }, process.env.JWT_SECRET || 'bookshop-course-demo-secret', { expiresIn: '1h' });
  req.session.authorization = { token };
  return res.json({ message: 'User successfully logged in' });
});
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.body.review || req.query.review;
  if (typeof review !== 'string' || !review.trim()) return res.status(400).json({ message: 'Review is required' });
  book.reviews[req.user.username] = review;
  return res.json({ message: 'Review successfully added or updated', reviews: book.reviews });
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.hasOwn(book.reviews, req.user.username)) return res.status(404).json({ message: 'Review not found' });
  delete book.reviews[req.user.username];
  return res.json({ message: 'Review successfully deleted', reviews: book.reviews });
});
module.exports = { authenticated: regd_users, isValid, authenticatedUser, users };
