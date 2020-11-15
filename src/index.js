const yargs = require('yargs')
const run = require('./run')
const localConfiguration = require('./config')

module.exports = function (ctx) {
  parseArguments()

  welcome(localConfiguration)
  run(localConfiguration)
}

function welcome(cfg) {
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
  console.log('JSPROXY Running in ' + cfg.getProperty('runningMode') || 'dual' + ' mode !!!')
  console.log('Context is ' + process.argv.context)
  console.log('-----------------------------------------------\n')

  let listeningNodes = []

  cfg.config.forEach(node => {
    class Node {
      constructor(config) {
        this.Target = 'http://' + config.server + ':' + config.targetPort + config.url
        this.Exposing = 'http://localhost:' + node.srcPort + config.url
      }
    }

    node.configs.forEach(it => {
      listeningNodes.push(new Node(it))
    })

  })

  console.table(listeningNodes)
}

function parseArguments() {
  let args = yargs
    .option('context', {
      description: 'Set a context that will be used as a key to load cache',
      alias: 'c',
      type: 'string',
      default: 'noContext'
    })
    .help()
    .alias('help', 'h')
    .argv;

    process.argv = args
}