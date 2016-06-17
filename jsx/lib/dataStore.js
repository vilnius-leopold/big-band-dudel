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
					eventEmitter.emit('dataStore.updated', dataStore);
				}
			});

			alert('An ERROR occured:\n' + e);
		} else {
			// update local store
			dataStore = response;
			eventEmitter.emit('dataStore.updated', dataStore);
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

function addItem(listName, data, sorter) {
	data.id = getNextId(listName);

	dataStore[listName].push(data);

	if (sorter)
		dataStore[listName].sort(sorter);

	eventEmitter.emit('dataStore.updated', dataStore);

	updateRemoteStore();

	return data.id;
}

function removeItemById(listName, itemId) {
	var index = dataStore[listName].findIndex( (item) => {
		return item.id === itemId
	});

	dataStore[listName].splice(index, 1);

	eventEmitter.emit('dataStore.updated', dataStore);

	updateRemoteStore();
}

eventEmitter.on("statusChanged", (eventId, musicianId, status) => {
		var clickedEvent = dataStore.events.find( (e) => {
			return e.id === eventId;
		});

		var clickedMember = clickedEvent.lineUp[musicianId];

		if ( ! clickedMember ) {
			clickedEvent.lineUp[musicianId] = {status: 3};
			clickedMember = clickedEvent.lineUp[musicianId]
		}

		clickedMember.status = status;

		eventEmitter.emit('dataStore.updated', dataStore);

		updateRemoteStore();
});

eventEmitter.on("removeMusician", (id) => {
	dataStore.events.forEach( (e) => {
		if ( e.lineUp[id] )
			delete e.lineUp[id];
	});

	removeItemById("musicians", id);
});

eventEmitter.on("addInstrument", (data) => {
	var id = addItem("instruments", data);
	eventEmitter.emit("instrumentAdded", id);
});

eventEmitter.on("addMusician", (data) => {
	var id = addItem("musicians", data, (a,b) => {
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});
});

eventEmitter.on("removeEvent", (id) => {
	removeItemById("events", id);
});

eventEmitter.on("addEvent", (data) => {
	data.lineUp = {};

	var id = addItem("events", data, (a,b) => {
		return a.date - b.date;
	});
});

module.exports = {
	data: dataStore
};