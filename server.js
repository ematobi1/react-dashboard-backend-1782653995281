const express = require('express');
const app = express();
const { Pool } = require('pg');
const auth = require('./auth');
const pool = new Pool({
  user: 'username',
  host: 'localhost',
  database: 'database',
  password: 'password',
  port: 5432,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).send({ message: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Invalid token' });
  }
};

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (!user.rows[0] || user.rows[0].password !== password) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.send({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});