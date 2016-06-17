const events = require('events');

const eventEmitter = new events.EventEmitter();

var oldEmit = eventEmitter.emit;

eventEmitter.emit = function() {
	console.log(arguments[0], arguments[1]);

	oldEmit.apply(eventEmitter, arguments);
}

module.exports = eventEmitter;