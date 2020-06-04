var nconfig = require('nconf')

nconfig.argv().env();
nconfig.file({file: './config.json'})

var config = nconfig.get('nodes');

module.exports = config;