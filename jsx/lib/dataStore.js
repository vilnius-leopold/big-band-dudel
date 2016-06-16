const eventEmitter     = require('./event-emitter.js');

var dataStore = initialData || {
	instruments: [],
	musicians: [],
	events: []
};


function updateRemoteStore() {
	sendData(dataStore, function(err, response) {
		if (err) {
			// reload from server
			getData( (err, response) => {
				if (err) {
					alert('An ERROR occured:\n' + e);
				} else {
					// update local store
					dataStore = response;
					updateApp();
				}
			});

			alert('An ERROR occured:\n' + e);
		} else {
			// update local store
			dataStore = response;
			updateApp();
		}

	});
}

function getData(cb) {
	var XHR      = new XMLHttpRequest();

	XHR.addEventListener('load', function(event) {
		var responseData = null,
		    error        = null;

		try{
			responseData = JSON.parse(event.target.responseText);
		} catch( e ) {
			error = e;
		}

		cb(error, responseData);
	});

	XHR.addEventListener('error', function(event) {
		console.error('Oups! Something goes wrong.');
		cb(event, null);
	});

	XHR.open('GET', '/data');

	XHR.send();
}

function sendData(data, cb) {
	var XHR      = new XMLHttpRequest();

	XHR.addEventListener('load', function(event) {
		var responseData = null,
		    error        = null;

		try{
			responseData = JSON.parse(event.target.responseText);
		} catch( e ) {
			error = e;
		}

		cb(error, responseData);
	});

	XHR.addEventListener('error', function(event) {
		console.error('Oups! Something goes wrong.');
		cb(event, null);
	});

	XHR.open('POST', '/data');

	XHR.setRequestHeader('Content-Type','text/plain');

	XHR.send( JSON.stringify(data) );
}

function getNextId(listName) {
	var nextMusicianId = 0;

	dataStore[listName].forEach( (m) => {
		if ( m.id > nextMusicianId )
			nextMusicianId = m.id;
	});

	nextMusicianId++;

	return nextMusicianId;
}

module.exports = {
	data: dataStore,
	addMusician( data ) {
		data.id = getNextId("musicians");

		dataStore.musicians.push(data);

		eventEmitter.emit('updateApp');

		sendData(dataStore, function(err, response) {
			if (err) {
				// reload from server
				getData( (err, response) => {
					if (err) {
						alert('An ERROR occured:\n' + e);
					} else {
						// update local store
						dataStore = response;
						eventEmitter.emit('updateApp');
					}
				});

				alert('An ERROR occured:\n' + e);
			} else {
				// update local store
				dataStore = response;
				eventEmitter.emit('updateApp');
			}

		});
	}
};