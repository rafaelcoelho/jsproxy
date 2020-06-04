# jsproxy
A http proxy used to cache request in order to provide a standalone development environment

##Setup
In order to create the endpoints at your local the file `./config.json` have to configured properly once that one will be used during the runtime to reach out the real server.

### Example
```json
{
  "nodes": [
    {
      "server": "localhost",
      "url": "/products",
      "mediaType": "application/json",
      "targetPort": 8081,
      "srcPort": 8080,
      "cache": true
    }
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
$node index.js
```