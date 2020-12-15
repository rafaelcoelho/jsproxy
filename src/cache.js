const sqlite = require('sqlite3').verbose()
const fs = require('fs')
const zlib = require('zlib');

var db, isMultipleResponseEnable

function init(context, configuration) {
  isMultipleResponseEnable = configuration.getProperty('multipleResponseEnable') | false

  const dataDirectory = './data/'
  let dbFileName = dataDirectory + context + '.db'
  let dbExists = fs.existsSync(dbFileName)

  if (!dbExists) {
    fs.mkdirSync(dataDirectory, { recursive: true })

    db = new sqlite.Database(dbFileName, (err) => {

      if (err) {
        console.error('Error to open db' + err.message)
      }

      db.run('CREATE TABLE cache(id text, httpCode text, seq number DEFAULT 0, payload blob, request text)')
    })
  } else {
    db = new sqlite.Database(dbFileName, err => {

      if (err) console.error('Error to open db' + err.message)

      let resetSeq = `UPDATE cache SET seq = 0 WHERE id IS NOT NULL`

      db.run(resetSeq)
    })
  }
}

var read = (key, callback) => {
  const query = 'SELECT payload, httpCode, seq FROM cache where id = ?'

  db.get(query, [key], (err, row) => {
    if (err) {
      console.error(err.message)
    }

    let rawPayload

    if (row) {
      row.payload = zlib.inflateSync(Buffer.from(row.payload)).toString()
      rawPayload = JSON.parse(row.payload)
      row.payload = rawPayload[row.seq]

      if (rawPayload.length == ++row.seq) {
        row.seq = 0
      }

      updateSeq(key, row.seq)
    }

    callback(row, rawPayload)
  })
}

var updateSeq = (key, seq) => {
  const query = `UPDATE cache SET seq = ? WHERE id = ?`

  db.run(query, [seq, key], err => {
    if (err) {
      console.log('Error to save in cache: ' + err.message)
      return
    }
  })
}

var write = (key, httpCode, payload, request) => {
  read(key, (result, resultArray) => {
    if (result) {
      let data = [payload]

      if (isMultipleResponseEnable) {
        resultArray.push(payload)
        data = resultArray
      }

      update(key, httpCode, data)
    } else {
      const query = `INSERT into cache(id, httpCode, payload, request)
                      VALUES(?, ?, ?, ?)`

      db.run(query, [key, httpCode, zlib.deflateSync(JSON.stringify([payload])), request ? JSON.stringify(request) : undefined], errWrite => {
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
                 WHERE id = ?`

  db.run(query, [httpCode, zlib.deflateSync(JSON.stringify(payload)), key], err => {
    if (err) {
      console.log('Error to save in cache: ' + err.message)
      return
    }
  })
}

var dump = (callback) => {
  const query = 'SELECT request, httpCode, payload FROM cache WHERE id IS NOT NULL'

  db.all(query, [], (err, row) => {
    if (err) {
      console.error('Error to generate database dump: ' + err.message)

      callback(err)
      return
    }

    let result = []

    row.forEach(el => {
      el.payload = zlib.inflateSync(Buffer.from(el.payload)).toString()

      let data = {}

      data['request'] = JSON.parse(el.request)
      data['httpCode'] = el.httpCode
      data['response'] = JSON.parse(el.payload)

      result.push(data)
    })

    callback(null, result)

  })
}

var close = () => db.close()

module.exports = {
  init,
  read,
  write,
  dump,
  close
}