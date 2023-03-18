'use strict';
// load package
const express = require('express');
const mysql = require('mysql');
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const port = 8080;

app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false })); // Add this line
app.use(bodyParser.urlencoded({ extended: true }));

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

    //drop the tables if they exist
  db.query('DROP TABLE IF EXISTS messages', (err, result) => {
      if (err) throw err;
      console.log('Table channels deleted');
      });
  db.query('DROP TABLE IF EXISTS channels', (err, result) => {
    if (err) throw err;
    console.log('Table messages deleted');
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

// POST request for creating a new channel
app.post('/createChannel', (req, res) => {
  const channelName = req.body.name;
  console.log("inside the post method create channel");
  //select the database
  db.query('USE chatdb', (err, result) => {
    if (err) throw err;
    console.log('Database chatdb selected.');
  });

  if (!channelName) {
    res.status(400).send('Channel name is required.');
    return;
  }
  console.log("channel name is: " + JSON.stringify( req.body));
  const sql = 'INSERT INTO channels (name) VALUES (?)';
  db.query(sql, [channelName], (err, result) => {
    if (err) throw err;
    console.log(`Channel '${channelName}' created with ID: ${result.insertId}`);
    // res.status(201).send(`Channel '${channelName}' created with ID: ${result.insertId}`);
  });
});

// GET request for showing all channels
app.get('/showChannels', (req, res) => {
  db.query('USE chatdb', (err, result) => {
    if (err) throw err;
    console.log('Database chatdb selected.');
  });
  const sql = 'SELECT * FROM channels';
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log('Channels fetched successfully');
    res.send(result);
  });
});
// GET request for fetching messages of a specific channel
app.get('/channel/:id/messages', (req, res) => {
  const channelId = req.params.id;

  db.query('USE chatdb', (err, result) => {
    if (err) throw err;
    console.log('Database chatdb selected.');
  });

  if (!channelId) {
    res.status(400).send('Channel ID is required.');
    return;
  }

  const sql = 'SELECT * FROM messages WHERE channel_id = ?';
  db.query(sql, [channelId], (err, result) => {
    if (err) throw err;
    console.log(`Messages fetched for channel ID: ${channelId}`);
    res.send(result);
  });
  console.log("inside the get method fetch messages");
});

// POST request for creating a new message in a channel
app.post('/channel/:channelId/messages', (req, res) => {
  const channelId = req.params.channelId;
  const content = req.body.content;
  console.log("inside the post method create message");

  // Add your logic to insert the message into the messages table
  const sql = 'INSERT INTO messages (channel_id, content, timestamp) VALUES (?, ?, NOW())';
  db.query(sql, [channelId, content], (err, result) => {
    if (err) throw err;
    console.log(`Message '${content}' created with ID: ${result.insertId}`);
    res.status(201).send(`Message '${content}' created with ID: ${result.insertId}`);
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
