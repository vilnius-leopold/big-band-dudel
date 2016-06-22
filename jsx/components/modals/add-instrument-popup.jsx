const ReactDOM = require('react-dom');
const React    = require('react');

const Modal = require('./../modal.jsx');

var   dataStore        = require('./../../lib/dataStore.js');
const eventEmitter = require('./../../lib/event-emitter.js');

var AddInstrumentPopup = module.exports = React.createClass({
	getInitialState: function() {
		this.wasDismissed = true;
		this.addedInstrumentId = null;

		return {
			name : ''
		};
	},
	handleNameChange: function(event) {
		this.setState({name: event.target.value});
	},
	addInstrument( event ) {
		var validationErrors = [];

		// validate Name
		var trimmedName = this.state.name.trim();

		if (trimmedName === '') {
			validationErrors.push("Instrument name can not be empty");
		} else {
			var index = this.props.instruments.findIndex( (m) => {
				if (m.name === trimmedName)
					return true;

				return false;
			});

			if ( index !== -1)
				validationErrors.push("Instrument <strong>"+trimmedName+"</strong> already exists");
		}

		if ( validationErrors.length )
			return validationErrors;

		this.wasDismissed = false;

		this.addedInstrumentId = dataStore.addInstrument({
			name: trimmedName
		});

		return null;
	},
	clearInputs() {
		this.setState(this.getInitialState());
	},
	focusNameInput() {
		this.refs.nameInput.focus();
	},
	emitCloseEvent() {
		var eventType = this.wasDismissed ? 'dismissed' : 'submitted';

		eventEmitter.emit('instrumentModal.' + eventType, this.addedInstrumentId);
	},
	render() {
		var options = dataStore.data.instruments.map( (instr) => {
			return (
				<option value={instr.id}>{instr.name}</option>
			);
		});

		return (
			<Modal
				modalTitle="Add new instrument"
				triggerEvent="openAddInstrumentPopup"
				onShow={this.clearInputs}
				onShown={this.focusNameInput}
				onClose={this.emitCloseEvent}
				onConfirm={this.addInstrument}
			>
				<div className="form-group">
					<label>Name</label>
					<input
						ref="nameInput"
						autoFocus
						type="text"
						className="form-control"
						placeholder="bag pipes"
						value={this.state.name}
						onChange={this.handleNameChange}
					/>
				</div>
			</Modal>
		);
	}
});
