const axios = require('axios').default
const express = require('express')
const parser = require('body-parser')
const md5 = require('md5')

const localConfiguration = require('./config')
const cacheDB = require('./cache')
const flushEP = require('./flushEndpoint')

const timeout = 8000
var defaultTimeout = 0;

flushEP()

localConfiguration.forEach(cfg => {
  let app = express()

  var isReqCount = 0;

  cfg.configs.forEach(service => {
    app.use(parser.raw({ type: service.mediaType }))

    app.use(service.url, (req, res, next) => {
      res.type(service.mediaType)

      if (cfg.cache) {
        let requestIdentifier = req.body + req.originalUrl
        let hash = md5(requestIdentifier + req.method)

        cacheDB.read(hash, (result) => {
          if (result) {
            //console.log('Reading from caching for: ' + req.method + ' : ' + req.originalUrl)

            isReqCount++

            if (res.req.originalUrl.includes('ccoi')) {

              if (isReqCount >= 2500) {
                isReqCount = 0
                console.log('Adding timeout ccoi')

                setTimeout(function () {
                  res.status(result.httpCode).send(result.payload)
                }, timeout)
              } else {
                res.status(result.httpCode).send(result.payload)
              }
            } else if (res.req.originalUrl.includes('submit')) {
              
              if (isReqCount >= 2400) {
                console.log('Adding timeout submit')

                setTimeout(function () {
                  res.status(result.httpCode).send(result.payload)
                }, timeout)
              } else {
                res.status(result.httpCode).send(result.payload)
              }
            } else {
              //res.status(result.httpCode).send(result.payload)
              setTimeout(function () {
                res.status(result.httpCode).send(result.payload)
              }, defaultTimeout)
            }
          } else {
            next()
          }
        })
      } else {
        next()
      }
    })

    app.use(service.url, (req, res) => {
      console.log('Calling southbound for: ' + req.method + ' : ' + req.originalUrl)

      let requestIdentifier = req.body + req.originalUrl
      let hash = md5(requestIdentifier + req.method)

      sendRequest(service, req, (result, httpCode) => {
        res.status(httpCode).send(result)

        cacheDB.write(hash, httpCode, result)
      })
    })

  })

  app.listen(cfg.srcPort);
})

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
      resultHandler(err, err.response ? err.response.status : 500)
    })
}
