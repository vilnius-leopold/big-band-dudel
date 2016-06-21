const $       = require('jquery');
const moment = require('moment');
const bootstrap = require('bootstrap');

const ReactDOM = require('react-dom');
const React    = require('react');

const eventEmitter = require('./../../lib/event-emitter.js');
var   dataStore    = require('./../../lib/dataStore.js');

var EventPopover = module.exports = React.createClass({
	getInitialState() {
		return {};
	},
	componentDidMount() {
	},
	render() {
		var lineUp      = dataStore.getEvent(this.props.eventId).lineUp,
		    muscians    = dataStore.getMusicians(),
		    instruments = dataStore.getInstruments();

		var instrumentList = {},
		    contentKeyId   = 1,
		    eventKeyId     = 1;

		for ( var musicianId in lineUp ) {
			var data = lineUp[musicianId];
			var musicianData = muscians.find( (m) => {
				return m.id === parseInt(musicianId);
			});

			var instrumentData = instruments.find( (i) => {
				return i.id === musicianData.instrumentId;
			});

			var instrumentName = instrumentData.name;

			if ( ! instrumentList[instrumentName] )
				instrumentList[instrumentName] = [];



			instrumentList[instrumentName].push({
				status: data.status,
				musicianName: musicianData.name
			});
		}

		var instrumentElements = [],
		    instrumentKeyId    = 1;

		for ( var instrumentName in instrumentList ) {
			var musicianData = instrumentList[instrumentName];


			var statusList = musicianData.filter( (m) => {
				return m.status === 1 || m.status === 2;
			});

			if ( statusList.length === 0 )
				continue;

			var statusKeyId = 1;

			statusList = statusList.sort( (a,b) => {
				if (a.status > b.status) return 1;
				if (a.status < b.status) return -1;
				return 0;
			}).map( (data) => {
				var colorClasses = {
					1: "alert-success",
					2: "alert-warning"
				};

				var colorClass = colorClasses[data.status];


				return (
					<span
						key={statusKeyId++}
						title={data.musicianName}
						className={"lineup-instrument-status-item " + colorClass}
					/>
				);
			});

			instrumentElements.push(
				<tr key={instrumentKeyId++}>
					<th className="lineup-instrument-name">{instrumentName}</th>
					<td>{statusList}</td>
				</tr>
			);
		}

		if ( ! instrumentElements.length )
			instrumentElements = []

		var popupContent = <em key={contentKeyId++}>Apparently everybody hates this event</em>;

		if ( instrumentElements.length )
			popupContent =
				<table key={contentKeyId++} className="lineup-table">
					<tbody>
						{instrumentElements}
					</tbody>
				</table>;

		return (
			<div key={eventKeyId++}>
				{popupContent}
			</div>
		);
	}
});