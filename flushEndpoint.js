const express = require('express')
const parser = require('body-parser')
const fs = require('fs')

var flushEndpoint = function () {
    var app = express()

    app.use(parser.json())
    app.post('/write', (req, res, next) => {
        if (req.body.fileName) {
            fs.writeFile(req.body.fileName + '.txt', "hello file it's just a testing", (err) => {
                if (err) {
                    res.sendStatus(400).json({ 'message': err.message })
                    return
                }
                res.status(201).json({ file: req.body.fileName })
            })
        }
    })

    app.listen(8082)
}

module.exports = flushEndpoint