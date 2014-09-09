json-rpc-client
===============

Node.js JSON-RPC 2.0 TCP implementation with persistent connections - fast and without dependencies

## Installation

	npm install json-rpc-client

## Example usage
    var json_rpc_client = require('json_rpc_client')

    var rpc = json_rpc_client.connect({ port: 7070, host: '127.0.0.1'}, function()
    {
        rpc.send('method', {"param1" : 1, "param2" : 2}, function(error, reply)
        {
            if (error)
                console.log(error)
            else
                console.log(reply)
        })
    })

## API

    var json_rpc_client = require('json_rpc_client')

### send (options, callback)

Creates a new RPC connection to the server.

Options:

* host: Host the client should connect to. Defaults to '127.0.0.1'.
* port: Port the client should connect to. Defaults to '7070'.

Callback:
* error - string/object or null if no error
* reply - object containing reply data

### close (callback)

Closes RPC connection and returns callback afterwards.

### Event 'error'
* 'Error Object'

Emitted when an error occurs.

### Event: 'close'
* 'had_error' 'Boolean' true if the socket had a transmission error

Emitted once the RPC connection socket is fully closed. The argument
'had_error' is a boolean which says if there was an error.
