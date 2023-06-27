var net = require('net');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data.db');

// Create the posts table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    co2 INT,
    tvoc INT,
    timestamp TEXT
)`, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table "data" created or already exists');
  }
});

var client = new net.Socket();
client.connect(16000, '10.0.0.75', function() {
	console.log('Connected');
	client.write('status\n');
});

client.on('data', function(data) {
    if(data.length > 2) {
        console.log('Received: ' + data);

        var adata = String(data).split(",");
        console.log(adata);

        db.run(
            `INSERT INTO data (co2, tvoc, timestamp) VALUES (?, ?, ?)`,
            adata,
            function (err) {
              if (err) {
                console.error('Error inserting post:', err);
                //callback(err);
              } else {
                console.log('New data inserted!');
                //callback(null, this.lastID);
              }
            }
          );
    }
	
	//client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});

function fetch_new() {
    client.write('status\n');
}

// Set logging interval in milliseconds
setInterval(fetch_new, 30000)
