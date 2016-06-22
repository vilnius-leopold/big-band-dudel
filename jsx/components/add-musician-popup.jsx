const ReactDOM = require('react-dom');
const React    = require('react');

const Modal = require('./modal.jsx');

const eventEmitter = require('./../lib/event-emitter.js');
var   dataStore    = require('./../lib/dataStore.js');

var AddMusicianPopup = module.exports = React.createClass({
	getInitialState: function() {
		return {
			id         : null,
			name       : '',
			instrumentId : -2
		};
	},
	handleNameChange: function(event) {
		this.setState({name: event.target.value});
	},
	handleInstrumentChange: function(event) {
		var value = parseInt(event.target.value);

		this.setState({instrumentId: value});

		if ( value === -1 ) {
			eventEmitter.emit('openAddInstrumentPopup');
		}
	},
	componentDidMount() {
		eventEmitter.on('instrumentModal.submitted', (instrumentId) => {
			this.setState({instrumentId: instrumentId});
			this.refs.instrumentInput.focus();
		});

		eventEmitter.on('instrumentModal.dismissed', () => {
			this.setState({instrumentId: -2});
			this.refs.instrumentInput.focus();
		});
	},
	addMusician( event ) {
		var validationErrors = [];

		// validate Name
		var trimmedName = this.state.name.trim();

		if (trimmedName === '') {
			validationErrors.push("User name can not be empty");
		} else if ( this.state.id === null ) {
			var index = this.props.musicians.findIndex( (m) => {
				if (m.name === trimmedName)
					return true;

				return false;
			});

			if ( index !== -1)
				validationErrors.push("User <strong>"+trimmedName+"</strong> already exists");
		}

		// validate Instrument
		if (this.state.instrumentId < 0) {
			validationErrors.push("You must select an instrument");
		}

		if ( validationErrors.length )
			return validationErrors;

		if ( this.state.id === null ) {
			dataStore.addMusician({
				name        : trimmedName,
				instrumentId: this.state.instrumentId
			});
		} else {
			dataStore.updateMusician({
				id          : this.state.id,
				name        : trimmedName,
				instrumentId: this.state.instrumentId
			});
		}

		return null;
	},
	onTrigger( data ) {
		console.log('current state', this.state);
		console.log('triggered AddMusicianPopup', data);

		if ( data )
			this.setState(data);
	},
	clearInputs() {
		this.setState(this.getInitialState());
	},
	focusNameInput() {
		this.refs.nameInput.focus();
	},
	render() {
		var options = this.props.instruments.map( (instr, i) => {
			return (
				<option key={i} value={instr.id}>{instr.name}</option>
			);
		});

		var modalTitle = this.state.id ? "Edit musician" : "Add musician";
		var submitButton = this.state.id ? "Save" : "Add";

		return (
			<Modal
				modalTitle={modalTitle}
				submitButton={submitButton}
				triggerEvent="openAddMusicianPopup"
				onShow={this.clearInputs}
				onShown={this.focusNameInput}
				onConfirm={this.addMusician}
				onTrigger={this.onTrigger}
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
					<select
						ref="instrumentInput"
						className="form-control"
						onChange={this.handleInstrumentChange}
						value={this.state.instrumentId}
					>
						<option value={-2}>Select instrument</option>
						{options}
						<option value={-1}>+ Add new instrument</option>
					</select>
				</div>
			</Modal>
		);
	}
});
