const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Connect to your MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
});

// Not sure if needed
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
    res.send('Inside the backend server');
});

// Initialize the database
app.get('/init', (req, res) => {
    const sql = 'CREATE DATABASE IF NOT EXISTS chatdb';
    db.query(sql, (err, result) => {
        if (err) throw err;
        console.log('Database chatdb created or already exists.');
    });

    //select the database
    db.query('USE chatdb', (err, result) => {
        if (err) throw err;
        console.log('Database chatdb selected.');
    });

  const createChannelsTable = `
    CREATE TABLE IF NOT EXISTS channels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )`;

  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      channel_id INT NOT NULL,
      content TEXT NOT NULL,
      timestamp DATETIME NOT NULL,
      FOREIGN KEY (channel_id) REFERENCES channels(id)
    )`;

  db.query(createChannelsTable, (err, result) => {
    if (err) throw err;
    console.log('Channels table created or already exists.');

    db.query(createMessagesTable, (err, result) => {
      if (err) throw err;
      console.log('Messages table created or already exists.');
    });

  });
  res.send('Database initialized.');
});

// Set up routes for your API (e.g., create channel, get all channels, etc.)
// ... (Add your existing API routes here)

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
