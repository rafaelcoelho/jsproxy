const nconfig = require('nconf')
const path = require('path')

let config = () => nconfig.get('nodes')
var getProperty = key => nconfig.get(key)

function init(configuration) {
    let cfgFile = path.join(process.cwd(), configuration.configurationFile)
    
    nconfig.argv().env();
    nconfig.file({file: cfgFile})
}

module.exports = {
    init,
    config,
    getProperty
};