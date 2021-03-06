const yargs = require('yargs')
const run = require('./run')
const localConfiguration = require('./config')

module.exports = function () {
  let args = parseArguments()

  localConfiguration.init(args)
  welcome(localConfiguration, args)

  run(localConfiguration, args)
}

function welcome(cfg, args) {
  let welcomeMessage = `
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

  console.log(welcomeMessage)

  console.log('-----------------------------------------------')
  console.log('JSPROXY Configuration endpoint is listening on http://localhost:' + args.port + '/jsproxy/v1')
  console.log('JSPROXY using ' + cfg.configurationFile + ' file as configuration')
  console.log('JSPROXY Running in ' + cfg.runningMode)
  console.log('Context is ' + cfg.context)
  console.log('-----------------------------------------------\n')

  let listeningNodes = []

  cfg.config().forEach(node => {
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
      default: 'default'
    })
    .option('runningMode', {
      description: 'Defines the mode tha proxy will run',
      alias: 'm',
      type: 'string',
      default: 'dual',
      choices: ['dual', 'playback', 'recorder']
    })
    .option('configurationFile', {
      description: 'The configuration file used to set the JSProxy',
      alias: 'f',
      type: 'string',
      default: "config.json"
    })
    .option('port', {
      description: 'The JSProxy Configuration listening port',
      alias: 'p',
      type: 'string',
      default: "7001"
    })
    .help()
    .alias('help', 'h')
    .argv;

    localConfiguration.runningMode = args.runningMode
    localConfiguration['context'] = args.context
    localConfiguration['configurationFile'] = args.configurationFile

    return args
}