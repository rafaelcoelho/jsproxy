const axios = require('axios').default
const express = require('express')
const parser = require('body-parser')
const md5 = require('md5')

const localConfiguration = require('./config')
const cacheDB = require('./cache')
const flushEP = require('./flushEndpoint')

flushEP()

localConfiguration.forEach(cfg => {
  let app = express()

  app.use(parser.raw({ type: cfg.mediaType }))

  app.use(cfg.url, (req, res) => {

    let requestIdentifier = req.body + req.originalUrl

    if (cfg.cache) {
      let hash = md5(requestIdentifier + req.method)

      cacheDB.read(hash, (result) => {
        if (result) {
          res.status(result.httpCode).send(result.payload)
          return
        }

        sendRequest(cfg, req, (result, httpCode) => {
          res.status(httpCode).send(result)

          cacheDB.write(hash, httpCode, result)
        })
      })
    } else {
      sendRequest(cfg, req, (result, httpCode) => {
        res.send(httpCode).send(result)
      })
    }
  })

  app.listen(cfg.srcPort);
});

function sendRequest(localConfig, req, resultHandler) {
  let config = {
    headers: {
      'Content-Type': localConfig.mediaType
    },
    baseURL: 'http://' + localConfig.server + ':' + localConfig.targetPort,
    url: req.originalUrl,
    method: req.method,
    data: req.body
  }

  axios.request(config)
    .then(it => {
      resultHandler(it.data, it.status)
    })
    .catch(err => {
      console.error("Error: " + err)
      resultHandler(err, err.response ? err.response.status : 500)
    })
}
