'use strict';

const ReactDOM = require('react-dom');
const React    = require('react');
const $        = require('jquery');

const eventEmitter       = require('./lib/event-emitter.js');
var   dataStore          = require('./lib/dataStore.js').data;
const AddMusicianPopup   = require('./components/add-musician-popup.jsx');
const AddEventPopup   = require('./components/add-event-popup.jsx');
const AddInstrumentPopup = require('./components/add-instrument-popup.jsx');


eventEmitter.on('updateApp', updateApp);

const log = console.log.bind(console);

function getNextId(listName) {
	var nextMusicianId = 0;

	dataStore[listName].forEach( (m) => {
		if ( m.id > nextMusicianId )
			nextMusicianId = m.id;
	});

	nextMusicianId++;

	return nextMusicianId;
}

var statusIcons = {
	0: '✗',
	1: '✓',
	2: '?',
	3: '-'
};

var statusClasses = {
	0: 'alert-danger',
	1: 'alert-success',
	2: 'alert-warning',
	3: ''
};

var showAddEventPopup    = false;
var editMode             = false;


var MusicianItem = React.createClass({
	handleClick() {
		var index = dataStore.musicians.findIndex( (m) => {
			return m.id === this.props.musicianId;
		});

		dataStore.musicians.splice(index, 1);

		dataStore.events.forEach( (e) => {
			if ( e.lineUp[this.props.musicianId] )
				delete e.lineUp[this.props.musicianId];
		});

		updateApp();
		updateRemoteStore()
	},
	render() {
		return (
			<th>
				{this.props.name} [{this.props.instrument}]
				&nbsp;
				<span
					className={"remove-button glyphicon glyphicon-trash" + (editMode ? "" : " invisible")}
					aria-hidden="true"
					onClick={this.handleClick}
				></span>
			</th>
		);
	}
});

var EventItem = React.createClass({
	handleClick() {
		var index = dataStore.events.findIndex( (e) => {
			return e.id === this.props.eventId;
		});

		dataStore.events.splice(index, 1);

		updateApp();
		updateRemoteStore()
	},
	render() {
		return (
			<th>
				{this.props.title}
				&nbsp;<span
					className={"remove-button glyphicon glyphicon-trash" + (editMode ? "" : " invisible")}
					aria-hidden="true"
					onClick={this.handleClick}
				></span>

				<br />
				{this.props.date}
			</th>
		);
	}
});

function getNextStatus(currentStatus) {
	if ( currentStatus === 3 )
		return 0;

	return currentStatus + 1;
}


var StatusItem = React.createClass({
	handleClick() {
		if ( ! editMode )
			return;

		var clickedEvent = dataStore.events.find( (e) => {
			return e.id === this.props.eventId;
		});

		var clickedMember = clickedEvent.lineUp[this.props.musicianId];

		if ( ! clickedMember ) {
			clickedEvent.lineUp[this.props.musicianId] = {status: 3};
			clickedMember = clickedEvent.lineUp[this.props.musicianId]
		}

		clickedMember.status = getNextStatus(clickedMember.status);

		updateApp();
		updateRemoteStore()
	},
	render() {
		return (
			<td
				id={this.props.id}
				className={"status-item " + statusClasses[this.props.status]}
				onClick={this.handleClick}
			>
				{statusIcons[this.props.status]}
			</td>
		);
	}
});

var EventTable = React.createClass({
	render() {
		var sortedMusicians = this.props.musicians.sort( (a,b) => {
			if (a.name < b.name)
				return -1;
			else if (a.name > b.name)
				return 1;
			else
				return 0;
		});
		var sortedEvents    = this.props.events.sort( (a,b) => {
			return a.date - b.date;
		});

		var rows = sortedMusicians.map( (musician, i) => {
			var columns = sortedEvents.map( (event) => {
				var musicianInLineUp = event.lineUp[musician.id];
				var status = 3;

				if ( musicianInLineUp )
					status = event.lineUp[musician.id].status;

				var statusId = 'status-item-' + event.id + '-' + musician.id;

				return (
					<StatusItem
						key={statusId}
						id={statusId}
						musicianId={musician.id}
						eventId={event.id}
						status={status}
					/>
				);
			});


			var instrumentName = "";
			var instrumentData = dataStore.instruments.find( instr => instr.id === musician.instrumentId);

			if (instrumentData)
				instrumentName = instrumentData.name;

			columns.unshift(
				<MusicianItem
					key={'musician-item-' + musician.id}
					name={musician.name}
					musicianId={musician.id}
					instrument={instrumentName}
				/>
			);

			return ( <tr key={'row-' + (i + 1)}>{columns}</tr> );
		});

		var eventTitlesRow = sortedEvents.map( (event) => {
			return (
				<EventItem
					key={'event-item-' + event.id}
					title={event.title}
					eventId={event.id}
					date={event.date}
				/>
			);
		});

		eventTitlesRow.unshift(<th key="corner-element"></th>);

		rows.unshift(<tr key={'row-' + 0}>{eventTitlesRow}</tr>);

		return (
			<table className="table table-bordered">
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}
});

var AddInstrumentButton = React.createClass({
	handleClick() {
		eventEmitter.emit('openAddInstrumentPopup');
	},
	render() {
		return (
			<button
				className="btn btn-default"
				onClick={this.handleClick}
			>
				Add new instrument
			</button>
		);
	}
});

var AddMusicianButton = React.createClass({
	handleClick() {
		eventEmitter.emit('openAddMusicianPopup');
	},
	render() {
		return (
			<button
				className="btn btn-default"
				onClick={this.handleClick}
			>
				Add musician
			</button>
		);
	}
});

var AddEventButton = React.createClass({
	handleClick() {
		eventEmitter.emit('openAddEventPopup');
	},
	render() {
		return (
			<button
				className="btn btn-default"
				onClick={this.handleClick}
			>
				Add event
			</button>
		);
	}
});

var ToggleEditButton = React.createClass({
	handleClick(){
		editMode = ! editMode;
		updateApp();
	},
	render() {
		return (
			<button
				className={"btn btn-default pull-right" + (editMode ? " active" : "")}
				onClick={this.handleClick}
			>
				<span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
				&nbsp;{editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
			</button>
		);
	}
});

function updateApp() {
	ReactDOM.render(
		<div className="container">
			<h1>Big Band Dudel</h1>
			<div className="alert alert-info">
				<span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
				&nbsp;Participate in improving the dudel by submitting
				<ul>
					<li>feature requests</li>
					<li>bug reports</li>
					<li>questions</li>
				</ul>
				on the <a href="https://github.com/vilnius-leopold/big-band-dudel/issues">GitHub issue tracker</a>.
			</div>
			<div className={"alert alert-success" + (editMode ? "" : " invisible")}>
				<span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
				&nbsp;You are currently in <strong>Edit Mode</strong>
			</div>
			<div className="clearfix">
				<AddMusicianButton/>&nbsp;
				<AddEventButton/>
				<ToggleEditButton/>
			</div>
			<br/>
			<EventTable events={dataStore.events} musicians={dataStore.musicians}/>
			<AddMusicianPopup/>
			<AddEventPopup/>
			<AddInstrumentPopup/>
			<footer>
				<a href="https://github.com/vilnius-leopold/big-band-dudel">GitHub Repository</a>
			</footer>
		</div>,
		document.getElementById('app')
	);
}

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

// getData( (err, response) => {
// 	if (err) {
// 		alert('An ERROR occured:\n' + err);
// 	} else {
// 		// update local store
// 		dataStore = response;
// 		updateApp();
// 	}
// });

updateApp();