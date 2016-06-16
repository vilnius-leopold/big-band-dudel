const ReactDOM = require('react-dom');
const React    = require('react');

const Modal = require('./modal.jsx');

var   dataStore        = require('./../lib/dataStore.js');
const eventEmitter = require('./../lib/event-emitter.js');

var AddMusicianPopup = module.exports = React.createClass({
	getInitialState: function() {
		return {
			name       : '',
			instrument : -2
		};
	},
	handleNameChange: function(event) {
		this.setState({name: event.target.value});
	},
	handleInstrumentChange: function(event) {
		var value = parseInt(event.target.value);

		console.log('handleInstrumentChange', value);

		this.setState({instrument: value});

		if ( value === -1 ) {
			console.log('Opening addNewInstrumentPopup...');
			eventEmitter.emit('openAddInstrumentPopup');
		}
	},
	componentDidMount() {
		eventEmitter.on('instrumentAdded', (instrumentId) => {
			this.setState({instrument: instrumentId});
		});
		eventEmitter.on('AddInstrumentPopup.close', () => {
			this.refs.instrumentInput.focus();
		});
	},
	addMusician( event ) {
		console.log('this.state', this.state);

		var validationErrors = [];

		// validate Name
		var trimmedName = this.state.name.trim();

		if (trimmedName === '') {
			validationErrors.push("User name can not be empty");
		} else {
			var index = dataStore.data.musicians.findIndex( (m) => {
				if (m.name === trimmedName)
					return true;

				return false;
			});

			if ( index !== -1)
				validationErrors.push("User <strong>"+trimmedName+"</strong> already exists");
		}

		// validate Instrument
		if (this.state.instrument < 0) {
			validationErrors.push("You must select an instrument");
		}

		if ( validationErrors.length )
			return validationErrors;

		dataStore.addMusician({
			name: trimmedName,
			instrumentId: this.state.instrument
		})


		return null;
	},
	clearInputs() {
		this.setState(this.getInitialState());
	},
	focusTitleInput() {
		console.log('Modal shown event!');
		this.refs.titleInput.focus();
	},
	render() {
		var options = dataStore.data.instruments.map( (instr, i) => {
			return (
				<option key={i} value={instr.id}>{instr.name}</option>
			);
		});

		return (
			<Modal
				modalTitle="Add event"
				triggerEvent="openAddEventPopup"
				onShow={this.clearInputs}
				onShown={this.focusTitleInput}
				onConfirm={this.addMusician}
			>
				<div className="form-group">
					<label>Title</label>
					<input
						className="form-control"
						ref="titleInput"
						type="text"
						placeholder="Royal Albert Hall London"
						value={this.state.title}
						onChange={this.handleTitleChange}
					/>
					{/*
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
					*/}
				</div>
				<div className="form-group">
					<label>Date</label>
					<input
						className="form-control"
						type="text"
						placeholder="dd/mm/yyyy"
						value={this.state.date}
						onChange={this.handleDateChange}
					/>
					{/*
					<label>Instrument</label>
					<select
						ref="instrumentInput"
						className="form-control"
						onChange={this.handleInstrumentChange}
						value={this.state.instrument}
					>
						<option value={-2}>Select instrument</option>
						{options}
						<option value={-1}>+ Add new instrument</option>
					</select>
					*/}
				</div>
			</Modal>
		);
	}
});

/*
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
			id: getNextId("events"),
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
*/
