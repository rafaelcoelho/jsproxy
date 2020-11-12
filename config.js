var nconfig = require('nconf')

nconfig.argv().env();
nconfig.file({file: './config.json'})

var config = nconfig.get('nodes');
var getProperty = key => nconfig.get(key)

module.exports = {
    config,
    getProperty
};