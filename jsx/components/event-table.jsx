const ReactDOM = require('react-dom');
const React    = require('react');

const StatusItem   = require('./table-items/status-item.jsx');
const MusicianItem = require('./table-items/musician-item.jsx');
const EventItem    = require('./table-items/event-item.jsx');

var EventTable = module.exports = React.createClass({
	render() {
		var rows = this.props.musicians.map( (musician, i) => {
			var columns = this.props.events.map( (event) => {
				var musicianInLineUp = event.lineUp[musician.id];
				var status = 3;

				if ( musicianInLineUp )
					status = event.lineUp[musician.id].status;

				var statusId = 'status-item-' + event.id + '-' + musician.id;

				return (
					<StatusItem
						key={statusId}
						id={statusId}
						editMode={this.props.editMode}
						musicianId={musician.id}
						eventId={event.id}
						status={status}
					/>
				);
			});


			var instrumentName = "";
			var instrumentData = this.props.instruments.find( instr => instr.id === musician.instrumentId);

			if (instrumentData)
				instrumentName = instrumentData.name;

			columns.unshift(
				<MusicianItem
					key={'musician-item-' + musician.id}
					editMode={this.props.editMode}
					name={musician.name}
					musicianId={musician.id}
					instrument={instrumentName}
				/>
			);

			return ( <tr key={'row-' + (i + 1)}>{columns}</tr> );
		});

		var eventTitlesRow = this.props.events.map( (event) => {
			return (
				<EventItem
					key={'event-item-' + event.id}
					editMode={this.props.editMode}
					title={event.title}
					eventId={event.id}
					date={event.date}
				/>
			);
		});

		eventTitlesRow.unshift(<th key="corner-element"></th>);

		rows.unshift(<tr key={'row-' + 0}>{eventTitlesRow}</tr>);

		return (
			<table className="table table-bordered">
				<tbody>
					{rows}
				</tbody>
			</table>
		);

		// return (
		// 	<table className="table table-bordered">
		// 	</table>
		// );
	}
});
