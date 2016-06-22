const React    = require('react');

const eventEmitter = require('./../../lib/event-emitter.js');

const Icon = require('./../helpers/icon.jsx');
const emit = require('./../../lib/helpers/emit.js');


var MusicianItem = module.exports = React.createClass({
	render() {
		var editMode = this.props.editMode;

		return (
			<th className="musician-item">
				{this.props.name} [{this.props.instrument}]
				&nbsp;
				<Icon
					className="remove-button"
					type="trash"
					show={editMode}
					onClick={emit('removeMusician', this.props.musicianId)}/>
			&nbsp;
				<Icon
					className="remove-button"
					type="pencil"
					show={editMode}
					onClick={emit('openAddMusicianPopup', {id: this.props.musicianId, name: this.props.name, instrumentId: this.props.instrumentId})}/>
			</th>
		);
	}
});