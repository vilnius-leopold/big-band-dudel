const React    = require('react');
const moment   = require('moment');

const eventEmitter = require('./../../lib/event-emitter.js');
const EventPopover = require('./../popovers/event-popover.jsx');

var EventItem = module.exports = React.createClass({
	handleClick() {
		eventEmitter.emit('removeEvent', this.props.eventId);

		// var index = dataStore.events.findIndex( (e) => {
		// 	return e.id === this.props.eventId;
		// });

		// dataStore.events.splice(index, 1);

		// updateApp();
		// updateRemoteStore()
	},
	render() {
		return (
			<th>
				{this.props.title}
				&nbsp;<span
					className={"remove-button glyphicon glyphicon-trash" + (this.props.editMode ? "" : " invisible")}
					aria-hidden="true"
					onClick={this.handleClick}
				></span>

				<br />
				{moment(this.props.date).format("DD.MM.YYYY")}
				<EventPopover eventId={this.props.eventId}/>
			</th>
		);
	}
});