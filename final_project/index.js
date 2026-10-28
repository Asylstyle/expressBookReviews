const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const app = express();
app.use(express.json());
app.use('/customer', session({ secret: process.env.SESSION_SECRET || 'bookshop-course-session-secret', resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: 'lax' } }));
app.use('/customer/auth', (req, res, next) => {
  const token = req.session.authorization?.token;
  if (!token) return res.status(401).json({ message: 'Please log in first' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'bookshop-course-demo-secret');
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
});
app.use('/customer', require('./router/auth_users').authenticated);
app.use('/', require('./router/general').general);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
