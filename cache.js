const sqlite = require('sqlite3').verbose();

var fs = require('fs')
var dbExists = fs.existsSync('./stub.db')
var db = null;

if (!dbExists) {
  db = new sqlite.Database('./stub.db', (err) => {
    if (err) {
      console.error('Error to open db' + err.message)
    }
    db.run('CREATE TABLE cache(id text, httpCode text, seq number, payload blob)')
  })
} else {
  db = new sqlite.Database('./stub.db', (err) => {
    if (err) console.error('Error to open db' + err.message)
    let resetSeq = `UPDATE cache SET seq = 0
                    WHERE id IS NOT NULL`
    db.run(resetSeq)
  })
}

var read = (key, callback) => {
  const query = 'SELECT payload, httpCode, seq FROM cache where id = ?';

  db.get(query, [key], (err, row) => {
    if (err) {
      console.error(err.message)
    }

    let rawPayload

    if (row) {
      rawPayload = JSON.parse(row.payload)
      row.payload = rawPayload[row.seq]
      if (rawPayload.length == ++row.seq) {
        row.seq = 0;
      }
      updateSeq(key, row.seq)
    }

    callback(row, rawPayload)
  })
}
var updateSeq = (key, seq) => {
  const query = `UPDATE cache SET seq = ?
                 WHERE id = ?`
  db.run(query, [seq, key], err => {
    if (err) {
      console.log('Error to save in cache: ' + err.message)
      return
    }
  })
}
var write = (key, httpCode, payload) => {
  read(key, (result, resultArray) => {
    if (result) {
      resultArray.push(payload)
      update(key, httpCode, resultArray)
    } else {
      const query = `INSERT into cache(id, httpCode, payload, seq)
      VALUES(?, ?, ?, ?)`;
      db.run(query, [key, httpCode, JSON.stringify([payload]), 0], errWrite => {
        if (errWrite) {
          console.log('Error to save in cache: ' + errWrite.message)
          return
        }
      })
    }
  })
}
var update = (key, httpCode, payload) => {
  const query = `UPDATE cache SET httpCode = ?, payload = ?
                 WHERE id = ?`;

  db.run(query, [httpCode, JSON.stringify(payload), key], err => {
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