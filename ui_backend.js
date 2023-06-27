/*
  Handles retrieving data from the db and hosting the front end at port 8000
*/

const express = require('express');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const bp = require('body-parser')

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

const server = http.createServer(app);

const db = new sqlite3.Database('data.db');

// Route to retrieve the data
app.get('/data', (req, res) => {
  db.all('SELECT * FROM data', (err, rows) => {
    if (err) {
      console.error('Error retrieving posts:', err);
      res.status(500).json({ error: 'Error retrieving data' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/ui.css', function(req, res) {
  res.sendFile(__dirname + "/public/ui.css");
});

app.get('/ui.html', function(req, res) {
  res.sendFile(__dirname + "/public/ui.html");
});

// DEFAULT ROUTE
app.get("*", function (req, res) {
  res.sendFile(__dirname + "/public/ui.html");
});


// Start the server
const port = 8000; // Change as needed
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
