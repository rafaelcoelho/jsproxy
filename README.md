# jsproxy
A http proxy used to cache request in order to provide a standalone development environment

## Setup
In order to create the endpoints at your local the file `./config.json` have to configured properly once that one will be used during the runtime to reach out the real server.

### Configuration Example
```json
{
  "nodes": [
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
$npm install
$node index.js
```