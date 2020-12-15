# The JSProxy
A http proxy used to cache request in order to provide a standalone development environment

- [The JSProxy](#the-jsproxy)
  - [Getting Started](#getting-started)
  - [Setup](#setup)
    - [Configuration Example](#configuration-example)
    - [Multiple Response Support](#multiple-response-support)
    - [Running Mode](#running-mode)
    - [Configuration Endpoint](#configuration-endpoint)
      - [**Context Configuration**](#context-configuration)
      - [**Database Cache Dump**](#database-cache-dump)
  - [Cache Support](#cache-support)
  - [HTTPS Support](#https-support)
    - [HTTPS Example Configuration](#https-example-configuration)
  - [Try it out without real server](#try-it-out-without-real-server)
  - [Running](#running)
  - [License](#license)

## Getting Started
Install JSProxy

```
npm i -g jsproxy-server-stub
```

## Setup
In order to create the endpoints at your local the file `./config.json` have to configured properly once that one will be used during the runtime to reach out the real server.

### Configuration Example
<!-- embedme config.json -->
```json
{
  "multipleResponseEnable": true,
  "runningMode": "recorder",
  "saveRequest": true,
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

### Configuration Endpoint
There is a configuration endpoint available in order to set some context on proxy service. The default port is 7001 but is possible to define during initialization, such as:

```bash
$ node src/bin.js -p 8087
```

The endpoint is http://{server}:{port}/jsproxy/v1/configuration and POST method is expected.

#### **Context Configuration**  
This configuration is used as part of database PK entries in order to group by context each registry based on a operation context. The default value is a empty string ("").  In order to configure this value POST upon JSProxy Configuration endpoint, such as:

```json
{
    "context": {
        "key": "myOperationIdentifier"
    }
}
```

#### **Database Cache Dump** 
There is a endpoint listening to flush the database to json file in order to expose the cache data in plain mode, the endpoint is listening upon http://{server}:{port}/jsproxy/v1/flush using the POST http method. In order to save the request payload as well please check the configuration for that [saveRequest](#configuration-example) where the default values is `false`.

POST: http://{server}:{port}/jsproxy/v1/flush will generate the dbDumpFile.json in `./data` folder. If no payload request body the file `dataBase_dump.json` will be the default file name.

```json
{
    "fileName": "dbDumpFile"
}
```

## Cache Support
The cache is persisted upon SQLite Database

## HTTPS Support
The https termination is supported and the settings are done by `./config.json` file upon each node that will be exposed. If the https configuration is not part of the configuration the plain HTTP termination will be used.

### HTTPS Example Configuration
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
To run the app just prompt in case of using git repo

```bash
$ npm install
$ node src/bin.js -c myContext -m playback
```

To run the app just directly from release version prompt
```bash
$ jsproxy-server-stub -c myContext -m playback
```

Where:

-c: context to run (will be used to generate db file name and db key)

-m: runningMode (the possible values are: dual, playback, recorder)


To check supported arguments prompt

```bash
$ jsproxy-server-stub -h
```

## License

MIT