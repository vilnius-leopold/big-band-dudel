const ReactDOM = require('react-dom');
const React    = require('react');

const Modal = require('./modal.jsx');

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
			var index = this.props.musicians.findIndex( (m) => {
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

		eventEmitter.emit('addMusician', {
			name        : trimmedName,
			instrumentId: this.state.instrument
		});

		return null;
	},
	clearInputs() {
		this.setState(this.getInitialState());
	},
	focusNameInput() {
		console.log('Modal shown event!');
		this.refs.nameInput.focus();
	},
	render() {
		var options = this.props.instruments.map( (instr, i) => {
			return (
				<option key={i} value={instr.id}>{instr.name}</option>
			);
		});

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
				</div>
			</Modal>
		);
	}
});
