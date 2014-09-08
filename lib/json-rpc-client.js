/*
 * Copyright (C) 2014 Sartura, Ltd.
 *
 * Author: Petar Koretic <petar.koretic@sartura.hr>
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var util = require('util')
var events = require("events")
var net = require('net');

var json_rpc_client = function(options, connect_callback)
{
	var opts = options || {}
	var host = opts.host || '127.0.0.1'
	var port = opts.port || '7070'

	var rpc_id = 1
	var reply_queue = []
	var buffer = ''

	var self = this

	var client = new net.Socket().connect(port, host, function()
	{
		if (!connect_callback)
			return

		client.on('data', function(data)
		{
			buffer += data.toString().trim()

			for (var end_pos = buffer.indexOf('}'); end_pos !== -1; end_pos = buffer.indexOf('}', end_pos + 1))
			{
				var chunk = buffer.substring(buffer, end_pos + 1)

				try
				{
					var msg = JSON.parse(chunk)

					buffer = buffer.substring(end_pos+1).trim()
					end_pos = 0

					if (!msg.id)
						return self.emit('error', 'message has no id')

					if (!typeof reply_queue[msg.id] !== 'function')
						return self.emit('error', 'invalid callback for message: ' + msg.id)

					reply_queue[msg.id](null, msg)
					delete reply_queue[msg.id]
				}
				catch(e){}
			}
		})

		client.on('close', function()
		{
			client.destroy()
			self.emit('close')
		})

		connect_callback()
	})

	client.on('error', function(error)
	{
		self.emit('error', error)
	})

	this.send = function(method, params, reply_callback)
	{
		var rpc_message = {"jsonrpc": "2.0", "method": method, "params" : params, id : rpc_id}

		client.write(JSON.stringify(rpc_message))

		reply_queue[rpc_id++] = reply_callback
	}

	this.close = function(close_callback)
	{
		client.end(close_callback)
	}
}

util.inherits(json_rpc_client, events.EventEmitter);

exports.connect = function(opts, callback)
{
	if (!arguments.length)
		return

	if (typeof callback === 'undefined' && opts !== 'undefined')
		callback = opts

	if (typeof callback != 'function')
		return

	return new json_rpc_client(opts, callback);
}
