const sqlite = require('sqlite3').verbose();

var fs = require('fs')
var dbExists = fs.existsSync('./stub.db')
var db = null;

if (!dbExists) {
  db = new sqlite.Database('./stub.db', (err) => {
    if (err) {
      console.error('Error to open db' + err.message)
    }

    db.run('CREATE TABLE cache(id text, httpCode text, payload blob)')
  })
} else {
  db = new sqlite.Database('./stub.db', (err) => {
    if (err) console.error('Error to open db' + err.message)
  })
}

var read = (key, callback) => {
  const query = 'SELECT payload, httpCode FROM cache where id = ?';

  db.get(query, [key], (err, row) => {
    if (err) {
      console.error(err.message)
    }

    if (row) {
      row.payload = JSON.parse(row.payload)
    }

    callback(row)
  })
}

var write = (key, httpCode, payload) => {
  const query = `INSERT into cache(id, httpCode, payload)
                  VALUES(?, ?, ?)`;

  db.run(query, [key, httpCode, JSON.stringify(payload)], err => {
    if (err) {
      console.log('Error to save in cache: ' + err.message)
      return
    }
  })
}

var close = () => db.close();

module.exports = {
  read,
  write,
  close
}