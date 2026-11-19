
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
 try {
  const { name, email, password } = req.body || {};

  if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      password.length < 6
  ) {
   return res.status(400).json({
    message: 'Name, email, and password (6+ characters) are required.'
   });
  }

  const hash = await bcrypt.hash(password, 10);

  const [r] = await db.query(
      'INSERT INTO users(name,email,password) VALUES(?,?,?)',
      [name.trim(), email.trim().toLowerCase(), hash]
  );

  res.status(201).json({
   message: 'Registered successfully.',
   id: r.insertId
  });
 } catch (e) {
  if (e.code === 'ER_DUP_ENTRY') {
   return res.status(409).json({
    message: 'Email already registered.'
   });
  }

  console.error(e);
  res.status(500).json({
   message: 'Registration failed. Check DB settings.'
  });
 }
});

// Login
router.post('/login', async (req, res) => {
 try {
  const { email, password } = req.body || {};

  const [rows] = await db.query(
      'SELECT id,name,email,password,bio FROM users WHERE email=?',
      [(email || '').trim().toLowerCase()]
  );

  const u = rows[0];

  if (!u || !(await bcrypt.compare(password || '', u.password))) {
   return res.status(401).json({
    message: 'Invalid email or password.'
   });
  }

  const token = jwt.sign(
      { id: u.id, name: u.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
  );

  res.json({
   token,
   user: { id: u.id, name: u.name, email: u.email, bio: u.bio }
  });
 } catch (e) {
  console.error(e);
  res.status(500).json({
   message: 'Login failed. Check DB settings.'
  });
 }
});

// DEVELOPMENT ONLY: Reset password without email verification
router.post('/reset-password', async (req, res) => {
 if (process.env.NODE_ENV === 'production') {
  return res.status(404).json({ message: 'Not found.' });
 }

 try {
  const { email, newPassword } = req.body || {};

  if (!email?.trim() || !newPassword || newPassword.length < 6) {
   return res.status(400).json({
    message: 'Enter a registered email and a password of at least 6 characters.'
   });
  }

  const [rows] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
  );

  if (!rows.length) {
   return res.status(404).json({
    message: 'No account found with that email.'
   });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hash, rows[0].id]
  );

  res.json({
   message: 'Password reset successfully. You can now log in.'
  });
 } catch (e) {
  console.error(e);
  res.status(500).json({
   message: 'Password reset failed.'
  });
 }
});

module.exports = router;
