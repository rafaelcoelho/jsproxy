const express = require('express')
const parser = require('body-parser')
const md5 = require('md5')
const https = require('https')
const axios = require('axios').default
const cacheDB = require('./cache')

module.exports = function(localConfiguration) {
  const runningMode = localConfiguration.getProperty('runningMode') || 'dual'
  localConfiguration.config.forEach(cfg => {
    let app = express()

    cfg.configs.forEach(service => {
      app.use(parser.raw({ type: service.mediaType }))

      app.use(service.url, (req, res, next) => {
        res.type(service.mediaType)

        if (runningMode != 'recorder' && cfg.cache) {
          let requestIdentifier = req.body + req.originalUrl
          let hash = md5(requestIdentifier + req.method)

          cacheDB.read(hash, (result) => {
            if (result) {
              res.status(result.httpCode).send(result.payload)
            } else {
              next()
            }
          })
        } else {
          next()
        }
      })

      app.use(service.url, (req, res) => {
        console.log('Going to call southbound with method | ' + req.method + ' | http://' + service.server + ':' + service.targetPort + req.originalUrl)

        let requestIdentifier = req.body + req.originalUrl
        let hash = md5(requestIdentifier + req.method)

        if (['recorder', 'dual'].indexOf(runningMode) == -1)
          return console.error("Won't call southbound due to runningMode = " + runningMode)

        sendRequest(service, req, (result, httpCode) => {
          res.status(httpCode).send(result)
          cacheDB.write(hash, httpCode, result)
        })
      })
    })

    configureServer(cfg.https, app).listen(cfg.srcPort, _ => { })
  })
}

function configureServer(cfg, app) {
  if (cfg && cfg.enable) {
    console.log('Endpoint is listening over https')

    return https.createServer({
      key: fs.readFileSync(cfg.keyFile),
      cert: fs.readFileSync(cfg.certFile),
      requestCert: true,
      rejectUnauthorized: false,
      ca: [fs.readFileSync(cfg.caFile)]
    }, app)
  }

  return app
}

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
      resultHandler(err.response.data, err.response ? err.response.status : 500)
    })
}