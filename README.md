# jsproxy
A http proxy used to cache request in order to provide a standalone development environment

## Setup
In order to create the endpoints at your local the file `./config.json` have to configured properly once that one will be used during the runtime to reach out the real server.

### Configuration Example
<!-- embedme config.json -->
```json
{
  "multipleResponseEnable": true,
  "runningMode": "recorder",
  "nodes": [
    {
      "configs": [
        {
          "server": "remoteServerAddress",
          "url": "/wsi/services",
          "mediaType": "text/xml",
          "targetPort": 8590
        }
      ],
      "cache": true,
      "srcPort": 8590,
      "https": {
        "enable": false,
        "keyFile": "privkey.pem",
        "certFile": "cert.pem",
        "caFile": "cert.pem"
      }
    },
    {
      "configs": [
        {
          "server": "127.0.0.1",
          "url": "/products",
          "mediaType": "application/json",
          "targetPort": 8081
        },
        {
          "server": "127.0.0.1",
          "url": "/items",
          "mediaType": "application/json",
          "targetPort": 8081
        }
      ],
      "srcPort": 8080,
      "cache": true
    }
  ]
}
```

### Multiple Response Support
The configuration key `multipleResponseEnable` is utilized in order to provide support for multiple response upon the same request.

By default this configuration is set to `false`

For instance:
 > Read -> Update -> Read

### Running Mode
The running mode is used to define the proxy behavior and the possibles values are:
   - **recorder:** the proxy only populates the cache and never provides response using the cache
   - **playback:** the proxy only provides the response based on existing cache if the cache doesn't have the response an error is returned
     - If the node is set as `cache: false`the local cache won't be used and is this case the southbound won't be called
   - **dual:** the proxy read and write towards cache

## Cache
The cache is persisted upon SQLite Database

## HTTPS
The https termination is supported and the settings are done by `./config.json` file upon each node that will be exposed. If the https configuration is not part of the configuration the plain HTTP termination will be used.

### For example
```json
{
  "nodes": [
    {
      "configs": [
        {
          "server": "remoteServerAddress",
          "url": "/wsi/services",
          "mediaType": "text/xml",
          "targetPort": 8590
        }
      ],
      "cache": true,
      "srcPort": 8590,
      "https": {
        "enable": false,
        "keyFile": "privkey.pem",
        "certFile": "cert.pem",
        "caFile": "cert.pem"
      }
    }]
}
```

## Try it out without real server
To try in local with no server available the `json-server` can be used, like

```bash
$npm install json-server
$json-server --watch restApiResources.json -p 8080
```

## Running
To run the app just prompt

```bash
$ npm install
$ node src/bind.js
```

To check supported arguments prompt
```bash
$ node src/bind.js -h
```