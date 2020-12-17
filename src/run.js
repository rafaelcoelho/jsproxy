const express = require('express')
const parser = require('body-parser')
const md5 = require('md5')
const https = require('https')
const axios = require('axios').default
const cacheDB = require('./cache')
const jsproxySetting = require('./endpoint')
const fs = require('fs')

var context = {contextKey: ""}

module.exports = function(configuration, args) {
  context.cfg = configuration.context

  cacheDB.init(context.cfg, configuration)
  jsproxySetting.configure(args, context, cacheDB)

  const runningMode = configuration.runningMode
  const saveRequest = configuration.getProperty('saveRequest') || false

  configuration.config().forEach(cfg => {
    let app = express()

    cfg.configs.forEach(service => {
      app.use(parser.raw({ type: service.mediaType }))

      app.use(service.url, (req, res, next) => {
        res.type(service.mediaType)

        if (runningMode != 'recorder' && cfg.cache) {
          let requestIdentifier = getKey(req)

          cacheDB.read(requestIdentifier, (result) => {
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

        let requestIdentifier = getKey(req)

        if (['recorder', 'dual'].indexOf(runningMode) == -1) {
          res.status(400).send("Won't call southbound due to running Mode = " + runningMode)
          return console.error("Won't call southbound due to running Mode = " + runningMode)
        }

        sendRequest(service, req, (result, httpCode) => {
          res.status(httpCode).send(result)
          cacheDB.write(requestIdentifier, httpCode, result, saveRequest && Object.keys(req.body) != 0 ? JSON.parse(req.body) : null)
        })
      })
    })

    configureServer(cfg.https, app).listen(cfg.srcPort, _ => { })
  })
}

function getKey(req) {
  return md5(req.body + req.originalUrl + req.method + context.cfg + context.contextKey)
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
    headers: req.headers,
    baseURL: 'http://' + localConfig.server + ':' + localConfig.targetPort,
    url: req.originalUrl,
    method: req.method,
    data: req.body
  }

  config.headers['Content-Type'] = localConfig.mediaType

  axios.request(config)
    .then(it => {
      resultHandler(it.data, it.status)
    })
    .catch(err => {
      console.error("Error: " + err)
      resultHandler(err.response.data, err.response ? err.response.status : 500)
    })
}