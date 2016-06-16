'use strict';

const ReactDOM = require('react-dom');
const React    = require('react');
const $        = require('jquery');

const eventEmitter = require('./lib/event-emitter.js');
const Modal        = require('./components/modal.jsx');


const log = console.log.bind(console);

function getNextEventId() {
	var nextEventId = 0;

	dataStore.events.forEach( (e) => {
		if ( e.id > nextEventId )
			nextEventId = e.id;
	});

	nextEventId++;

	return nextEventId;
}

function getNextMusicianId() {
	var nextMusicianId = 0;

	dataStore.musicians.forEach( (m) => {
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

var showAddMusicianPopup = false;
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

			columns.unshift(
				<MusicianItem
					key={'musician-item-' + musician.id}
					name={musician.name}
					musicianId={musician.id}
					instrument={musician.instrument}
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

var AddMusicianPopup = React.createClass({
	getInitialState: function() {
		return {
			name       : '',
			instrument : ''
		};
	},
	handleNameChange: function(event) {
		this.setState({name: event.target.value});
	},
	handleInstrumentChange: function(event) {
		this.setState({instrument: event.target.value});
	},
	addMusician( event ) {
		var validationErrors = [];

		// validate Name
		var trimmedName = this.state.name.trim();

		if (trimmedName === '') {
			validationErrors.push("User name can not be empty");
		} else {
			var index = dataStore.musicians.findIndex( (m) => {
				if (m.name === trimmedName)
					return true;

				return false;
			});

			if ( index !== -1)
				validationErrors.push("User <strong>"+trimmedName+"</strong> already exists");
		}

		// validate Name

		if (this.state.instrument === '') {
			validationErrors.push("You must select an instrument");
		}

		if ( validationErrors.length )
			return validationErrors;


		dataStore.musicians.push({
			id: getNextMusicianId(),
			name: trimmedName,
			instrument: this.state.instrument
		});

		updateApp();

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

		return null;
	},
	clearInputs() {
		this.setState({name: '', instrument: ''});
	},
	focusNameInput() {
		console.log('Modal shown event!');
		this.refs.nameInput.focus();
	},
	render() {
		return (
			<Modal
				modalTitle="Add musician"
				triggerEvent="openAddMusicianPopup"
				onShow={this.clearInputs}
				onShown={this.focusNameInput}
				onConfirm={this.addMusician}
			>
				<div className="form-group">
					<label>Name</label>
					<input
						ref="nameInput"
						autoFocus
						type="text"
						className="form-control"
						placeholder="John Doe"
						value={this.state.name}
						onChange={this.handleNameChange}
					/>
				</div>
				<div className="form-group">
					<label>Instrument</label>
					<input
						type="text"
						className="form-control"
						placeholder="flute"
						value={this.state.instrument}
						onChange={this.handleInstrumentChange}
					/>
				</div>
			</Modal>
		);
	}
});

var AddEventPopup = React.createClass({
	getInitialState: function() {
		return {
			title       : '',
			date : Date.now()
		};
	},
	handleTitleChange: function(event) {
		this.setState({title: event.target.value});
	},
	handleDateChange: function(event) {
		this.setState({date: event.target.value});
	},
	closePopup( event ) {
		if (
			event.target.id === "popup-overlay" ||
			event.target.id === "popup-cancel-button" ||
			event.target.id === "popup-close-button"
		) {
			showAddEventPopup = false;
			updateApp();

			this.setState(this.getInitialState());
		}
	},
	addEvent( event ) {
		dataStore.events.push({
			id: getNextEventId(),
			title: this.state.title,
			date: this.state.date,
			lineUp: {}
		});
		showAddEventPopup = false;
		updateApp();

		this.setState(this.getInitialState());

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
	},
	render() {
		return (
			<div id="popup-overlay" className={this.props.show ? '' : 'hidden'} onClick={this.closePopup}>
				<div id="popup-container">
					<button id="popup-close-button">✕</button>
					<h3>Add event</h3>
					<label>Title</label>
					<input
						className="form-control"
						type="text"
						placeholder="Royal Albert Hall London"
						value={this.state.title}
						onChange={this.handleTitleChange}
					/>
					<br />
					<label>Date</label>
					<input
						className="form-control"
						type="text"
						placeholder="dd/mm/yyyy"
						value={this.state.date}
						onChange={this.handleDateChange}
					/>
					<br />
					<button className="btn btn-primary" onClick={this.addEvent}>Add</button>
					<button id="popup-cancel-button" className="btn btn-default">Cancel</button>
				</div>
			</div>
		);
	}
});

var AddMusicianButton = React.createClass({
	handleClick(){
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
	handleClick(){
		showAddEventPopup = true;
		updateApp();
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
			<AddMusicianPopup show={showAddMusicianPopup}/>
			<AddEventPopup show={showAddEventPopup}/>
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