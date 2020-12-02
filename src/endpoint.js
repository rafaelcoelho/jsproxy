const express = require('express')
const parser = require('body-parser')
const fs = require('fs')

var app

function configure(args, context) {

    app = express()
    app.use(parser.json())

    ConfigurationEndpoint(context)
    FlushEnpoint()

    app.listen(args.port)
}

function FlushEnpoint() {

    app.post('/jsproxy/v1/write', (req, res, next) => {
        console.log('Receiving flush request ' + JSON.stringify(req.body))

        let code = 400
        let body = 'Not implemented yet!!!'

        res.status(code).json(body)
    })

    app.listen(8082)
}

function ConfigurationEndpoint(context) {

    app.post('/jsproxy/v1/configuration', (req, res) => {
        let code = 400

        if (req.body.context.key) {
            console.debug('JSProxy Context configuration updated from ' + context.contextKey + ' to ' + req.body.context.key)

            context.contextKey = req.body.context.key
            code = 201
        }

        res.status(code).json(req.body)
    })

}

module.exports = {
    configure
}