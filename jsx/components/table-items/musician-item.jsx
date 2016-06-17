const React    = require('react');

const eventEmitter = require('./../../lib/event-emitter.js');

var MusicianItem = module.exports = React.createClass({
	handleClick() {
		eventEmitter.emit('removeMusician', this.props.musicianId);

		// var index = dataStore.musicians.findIndex( (m) => {
		// 	return m.id === this.props.musicianId;
		// });

		// dataStore.musicians.splice(index, 1);

		// dataStore.events.forEach( (e) => {
		// 	if ( e.lineUp[this.props.musicianId] )
		// 		delete e.lineUp[this.props.musicianId];
		// });

		// updateApp();
		// updateRemoteStore()
	},
	render() {
		return (
			<th>
				{this.props.name} [{this.props.instrument}]
				&nbsp;
				<span
					className={"remove-button glyphicon glyphicon-trash" + (this.props.editMode ? "" : " invisible")}
					aria-hidden="true"
					onClick={this.handleClick}
				></span>
			</th>
		);
	}
});