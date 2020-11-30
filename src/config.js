const nconfig = require('nconf')
const path = require('path')

function init(configuration) {
    let cfgFile = path.join(process.cwd(), configuration.configurationFile)
    
    nconfig.argv().env();
    nconfig.file({file: cfgFile})
}

var config = () => nconfig.get('nodes')
var getProperty = key => nconfig.get(key)

module.exports = {
    init,
    config,
    getProperty
};