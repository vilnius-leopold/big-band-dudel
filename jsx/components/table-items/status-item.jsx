const React    = require('react');

const eventEmitter = require('./../../lib/event-emitter.js');

function getNextStatus(currentStatus) {
	if ( currentStatus === 3 )
		return 0;

	return currentStatus + 1;
}

var StatusItem = module.exports = React.createClass({
	handleClick() {
		if ( ! this.props.editMode )
			return;

		eventEmitter.emit("statusChanged",
			this.props.eventId,
			this.props.musicianId,
			getNextStatus(this.props.status)
		);

		// var clickedEvent = dataStore.events.find( (e) => {
		// 	return e.id === this.props.eventId;
		// });

		// var clickedMember = clickedEvent.lineUp[this.props.musicianId];

		// if ( ! clickedMember ) {
		// 	clickedEvent.lineUp[this.props.musicianId] = {status: 3};
		// 	clickedMember = clickedEvent.lineUp[this.props.musicianId]
		// }

		// clickedMember.status = getNextStatus(clickedMember.status);

		// updateApp();
		// updateRemoteStore()
	},
	render() {
		const statusIcons = {
			0: '✗',
			1: '✓',
			2: '?',
			3: '-'
		};

		const statusClasses = {
			0: 'alert-danger',
			1: 'alert-success',
			2: 'alert-warning',
			3: ''
		};

		return (
			<div
				id={this.props.id}
				className={"status-item " + statusClasses[this.props.status]}
				onClick={this.handleClick}
			>
				{statusIcons[this.props.status]}
			</div>
		);
	}
});