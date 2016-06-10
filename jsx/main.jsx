'use strict';

const log = console.log.bind(console);

var dataStore = null;

var nextId = 4;

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
	3: ''
};

var statusClasses = {
	0: 'alert-danger',
	1: 'alert-success',
	2: 'alert-warning',
	3: ''
};

var showAddMusicianPopup = false;
var showAddEventPopup    = false;


var MusicianItem = React.createClass({
	render() {
		return (
			<th>{this.props.name} [{this.props.instrument}]</th>
		);
	}
});

var EventItem = React.createClass({
	render() {
		return (
			<th>
				{this.props.title}
				<br />
				{this.props.date}
			</th>
		);
	}
});

var StatusItem = React.createClass({
	handleClick() {
		log('Clicked statusItem!');
		$('#' + this.props.id).popover({
			html: this.props.id
		});
		log('Clicked statusItem!', this.props.id);
	},
	render() {
		return (
			<td
				id={this.props.id}
				className={statusClasses[this.props.status]}
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
						status={status}
					/>
				);
			});

			columns.unshift(
				<MusicianItem
					key={'musician-item-' + musician.id}
					name={musician.name}
					instrument={musician.instrument}
				/>
			);

			return ( <tr key={'row-' + i}>{columns}</tr> );
		});

		var eventTitlesRow = sortedEvents.map( (event) => {
			return (
				<EventItem
					key={'event-item-' + event.id}
					title={event.title}
					date={event.date}
				/>
			);
		});

		eventTitlesRow.unshift(<th></th>);

		rows.unshift(eventTitlesRow);


		return (
			<table className="table">
				{rows}
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
	closePopup( event ) {
		if (
			event.target.id === "popup-overlay" ||
			event.target.id === "popup-cancel-button" ||
			event.target.id === "popup-close-button"
		) {
			showAddMusicianPopup = false;
			updateApp();

			this.setState({name: ''});
			this.setState({instrument: ''});
		}
	},
	addMusician( event ) {
		dataStore.musicians.push({
			id: getNextMusicianId(),
			name: this.state.name,
			instrument: this.state.instrument
		});
		showAddMusicianPopup = false;
		updateApp();

		this.setState({name: ''});
		this.setState({instrument: ''});

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
					<h3>Add musician</h3>
					<label>Name</label>
					<input
						type="text"
						placeholder="John Doe"
						value={this.state.name}
						onChange={this.handleNameChange}
					/>
					<br />
					<label>Instrument</label>
					<input
						type="text"
						placeholder="flute"
						value={this.state.instrument}
						onChange={this.handleInstrumentChange}
					/>
					<br />
					<button className="btn btn-primary" onClick={this.addMusician}>Add</button>
					<button id="popup-cancel-button" className="btn btn-default">Cancel</button>
				</div>
			</div>
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
						type="text"
						placeholder="Royal Albert Hall London"
						value={this.state.title}
						onChange={this.handleTitleChange}
					/>
					<br />
					<label>Date</label>
					<input
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
		showAddMusicianPopup = !showAddMusicianPopup;
		updateApp();
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
		showAddEventPopup = ! showAddEventPopup;
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

function updateApp() {
	ReactDOM.render(
		<div className="container">
			<h1>Big Band Dudle</h1>
			<div>
				<AddMusicianButton/>
				<AddEventButton/>
			</div>
			<EventTable events={dataStore.events} musicians={dataStore.musicians}/>
			<AddMusicianPopup show={showAddMusicianPopup}/>
			<AddEventPopup show={showAddEventPopup}/>
		</div>,
		document.getElementById('app')
	);
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

	XHR.setRequestHeader('Content-Type','application/json');

	XHR.send( JSON.stringify(data) );
}

getData( (err, response) => {
	if (err) {
		alert('An ERROR occured:\n' + err);
	} else {
		// update local store
		dataStore = response;
		updateApp();
	}
});
