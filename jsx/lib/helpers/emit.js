const eventEmitter = require('./../event-emitter.js');

const emit = module.exports = function(message, arg1) {
	return eventEmitter.emit.bind(eventEmitter, message, arg1);
};
