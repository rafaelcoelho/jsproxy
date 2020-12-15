const express = require('express')
const parser = require('body-parser')
const fs = require('fs')

var app

function configure(args, context, cacheDB) {

    app = express()
    app.use(parser.json())

    ConfigurationEndpoint(context)
    FlushEnpoint(cacheDB)

    app.listen(args.port)
}

function FlushEnpoint(cacheDB) {

    app.post('/jsproxy/v1/flush', (req, res, next) => {
        let file = req.body.fileName || 'dataBase_dump'
        file += '.json'

        console.log('Flush database to ./data/' + file)

        cacheDB.dump((err, result) => {
            if (err) {
                res.sendStatus(400).json({ 'message': err.message })
                return
            }

            fs.writeFileSync('./data/' + file, JSON.stringify(result))
            res.status(201).json({ file: file })
        })
    })
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