const axios = require('axios').default
const express = require('express')
const parser = require('body-parser')
const md5 = require('md5')
const https = require('https')
var fs = require('fs')

const localConfiguration = require('./config')

const runningMode = localConfiguration.getProperty('runningMode') || 'dual'

const cacheDB = require('./cache')
const flushEP = require('./flushEndpoint')

flushEP()

let welcome = `
-------------------<<<<<<<<<<<<<-------------------
by https://github.com/rafaelcoelho/jsproxy
------------------->>>>>>>>>>>>>-------------------\n
  888888 .d8888b. 8888888b. 8888888b.  .d88888b.Y88b   d88PY88b   d88P 
    "88bd88P  Y88b888   Y88b888   Y88bd88P" "Y88bY88b d88P  Y88b d88P  
     888Y88b.     888    888888    888888     888 Y88o88P    Y88o88P   
     888 "Y888b.  888   d88P888   d88P888     888  Y888P      Y888P    
     888    "Y88b.8888888P" 8888888P" 888     888  d888b       888     
     888      "888888       888 T88b  888     888 d88888b      888     
     88PY88b  d88P888       888  T88b Y88b. .d88Pd88P Y88b     888     
     888 "Y8888P" 888       888   T88b "Y88888P"d88P   Y88b    888     
   .d88P
 .d88P"                                                                
888P"
`

console.log(welcome)

console.log('-----------------------------------------------')
console.log('JSPROXY Running in ' + runningMode.toUpperCase() + ' mode !!!')
console.log('-----------------------------------------------\n')

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
      console.log('Try to call southbound for: ' + req.method + ' : ' + req.originalUrl)

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

  configureServer(cfg.https, app).listen(cfg.srcPort, _ => {
    console.log('Endpoint is listening on port ' + cfg.srcPort + ' port')
  })

})

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

  return app;
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
