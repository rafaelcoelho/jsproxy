const nconfig = require('nconf')
const path = require('path')

let cfgFile = path.join(process.cwd(), 'config.json')

nconfig.argv().env();
nconfig.file({file: cfgFile})

var config = nconfig.get('nodes');
var getProperty = key => nconfig.get(key)

module.exports = {
    config,
    getProperty
};