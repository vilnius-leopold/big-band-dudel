'use strict';

const log = console.log.bind(console);


var musicians = [
	{
		id: 1,
		name: "John",
		instrument: "trumpet"
	},
	{
		id: 2,
		name: "Tom",
		instrument: "drums"
	},
	{
		id: 3,
		name: "Nick",
		instrument: "bass"
	}
];

var nextId = 4;

var events = [
	{
		date: Date.now(),
		title: "Some Concert",
		lineUp: {
			1: {status: 0},
			2: {status: 1},
			3: {status: 2}
		}
	},
	{
		date: Date.now() + 3000,
		title: "Other Concert",
		lineUp: {
			1: {status: 0},
			2: {status: 0},
			3: {status: 2}
		}
	},
	{
		date: Date.now() - 3000,
		title: "Cool Concert",
		lineUp: {
			1: {status: 1},
			2: {status: 1},
			3: {status: 0}
		}
	}
];

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

var showPopup = false;

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

		var rows = sortedMusicians.map( (musician) => {
			var columns = sortedEvents.map( (event) => {
				var musicianInLineUp = event.lineUp[musician.id];
				var status = 3;

				if ( musicianInLineUp )
					status = event.lineUp[musician.id].status;

				return (
					<td className={statusClasses[status]}>
						{statusIcons[status]}
					</td>
				);
			});

			columns.unshift(<th>{musician.name} [{musician.instrument}]</th>);

			return (
				<tr>
					{columns}
				</tr>
			);
		 });

		var eventTitlesRow = sortedEvents.map( (event) => {
			return (
				<th>
					{event.title}
					<br />
					{event.date}
				</th>
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
			showPopup = false;
			updateApp();

			this.setState({name: ''});
			this.setState({instrument: ''});
		}
	},
	addMusician( event ) {
		musicians.push({
			id: nextId++,
			name: this.state.name,
			instrument: this.state.instrument
		});
		showPopup = false;
		updateApp();

		this.setState({name: ''});
		this.setState({instrument: ''});

		sendData({
			musicians: musicians
		}, function(err, response) {
			log('Done update remote DB', err, response);

			if (err) {
				// reload from server
				getData( (err, response) => {
					if (err) {
						alert('An ERROR occured:\n' + e);
					} else {
						// update local store
						musicians = response.musicians;
						updateApp();
					}
				});

				alert('An ERROR occured:\n' + e);
			} else {
				// update local store
				musicians = response.musicians;
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

var AddMusicianButton = React.createClass({
	handleClick(){
		console.log('Clicked AddMusicianButton');
		showPopup = !showPopup;
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

function updateApp() {
	ReactDOM.render(
		<div className="container">
			<h1>Big Band Dudle</h1>
			<div>
				<AddMusicianButton/>
				<button className="btn btn-default">Add event</button>
			</div>
			<EventTable events={events} musicians={musicians} />
			<AddMusicianPopup show={showPopup}/>
		</div>,
		document.getElementById('app')
	);
}

function getData(cb) {
	var XHR      = new XMLHttpRequest();

	XHR.addEventListener('load', function(event) {
		var responseData = null,
		    error        = null;

		log('responseText:', event.target.responseText);

		try{
			responseData = JSON.parse(event.target.responseText);
			log('parsed data:', responseData);
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
		log('Some text');
		// response = JSON.parse(response);
		log('OnLoad Response:', response );
		musicians = response.musicians;
		updateApp();
	}
});
