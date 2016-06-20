const React    = require('react');
const moment   = require('moment');

const Modal = require('./modal.jsx');

const eventEmitter = require('./../lib/event-emitter.js');
var   dataStore    = require('./../lib/dataStore.js');

const dateFormat = "DD.MM.YYYY";

var AddEventPopup = module.exports = React.createClass({
	getInitialState: function() {
		return {
			title : '',
			date : moment().format(dateFormat)
		};
	},
	handleTitleChange: function(event) {
		this.setState({title: event.target.value});
	},
	handleDateChange: function(event) {
		this.setState({date: event.target.value});
	},
	addEvent( event ) {
		var validationErrors = [];

		// validate Name
		var trimmedTitle = this.state.title.trim();


		if (trimmedTitle === '') {
			validationErrors.push("Title can not be empty");
		}

		// validate Instrument
		var userDate = this.state.date.trim();
		var userDateObj = moment(userDate, dateFormat);
		var todayDateObj = moment().hour(0).minute(0).second(0);

		if ( userDate === '' ) {
			validationErrors.push("Missing date");
		} else if ( ! userDateObj.isValid()) {
			validationErrors.push("Invalid date. Date must match <strong>" +dateFormat +"</strong>");
		} else if ( todayDateObj.unix() > userDateObj.unix() ) {
			validationErrors.push("Date has to be in the future");
		}

		if ( validationErrors.length )
			return validationErrors;

		dataStore.addEvent({
			title: trimmedTitle,
			date: userDateObj.valueOf()
		});

		return null;
	},
	clearInputs() {
		this.setState(this.getInitialState());
	},
	focusTitleInput() {
		this.refs.titleInput.focus();
	},
	render() {
		return (
			<Modal
				modalTitle="Add event"
				triggerEvent="openAddEventPopup"
				onShow={this.clearInputs}
				onShown={this.focusTitleInput}
				onConfirm={this.addEvent}
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
				</div>
				<div className="form-group">
					<label>Date</label>
					<input
						className="form-control"
						type="text"
						placeholder={dateFormat}
						value={this.state.date}
						onChange={this.handleDateChange}
					/>
				</div>
			</Modal>
		);
	}
});