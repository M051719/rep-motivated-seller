// auth.js
// PostgreSQL authentication for registration and login
const pool = require('../db');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { email, password, ownerName, type } = req.body;
    if (!email || !password || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (type === 'register') {
      try {
        const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
          return res.status(400).json({ error: 'User already exists' });
        }
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
          'INSERT INTO users (email, password_hash, owner_name) VALUES ($1, $2, $3)',
          [email, hash, ownerName]
        );
        return res.status(201).json({ message: 'Registered successfully' });
      } catch (err) {
        return res.status(500).json({ error: 'Registration failed' });
      }
    }
    if (type === 'login') {
      try {
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = userRes.rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        return res.json({ message: 'Login successful', ownerName: user.owner_name });
      } catch (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
    }
    return res.status(400).json({ error: 'Invalid request' });
  }
  res.status(405).json({ error: 'Method not allowed' });
};