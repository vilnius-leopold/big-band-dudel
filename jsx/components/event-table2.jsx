const ReactDOM = require('react-dom');
const React    = require('react');

const StatusItem   = require('./table-items/status-item.jsx');
const MusicianItem = require('./table-items/musician-item.jsx');
const EventItem    = require('./table-items/event-item.jsx');

var EventTable = module.exports = React.createClass({
	componentDidMount() {
		var musicianSidebar = this.refs.musicianSidebar,
		    eventHeader     = this.refs.eventHeader,
		    tableScrollPane = window;

		// listen to scroll event
		tableScrollPane.addEventListener('scroll', (event) => {

			var target     = window,
			    scrollLeft = target.scrollX,
			    scrollTop  = target.scrollY;

			musicianSidebar.style.top = -scrollTop  + 'px';
			eventHeader.style.left    = -scrollLeft + 'px';
		});
	},
	render() {
		var events = this.props.events.map( (event) => {
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

		var musicians = this.props.musicians.map( (musician) => {
			var instrumentName = "";
			var instrumentId   = -1;
			var instrumentData = this.props.instruments.find( instr => instr.id === musician.instrumentId);

			if (instrumentData) {
				instrumentName = instrumentData.name;
				instrumentId   = instrumentData.id;
			}

			return (
				<MusicianItem
					key={'musician-item-' + musician.id}
					editMode={this.props.editMode}
					name={musician.name}
					musicianId={musician.id}
					instrument={instrumentName}
					instrumentId={instrumentId}
				/>
			);
		});

		var statusColumns = this.props.events.map( (event) => {
			var statusItems = this.props.musicians.map( (musician) => {

				var status  = (event.lineUp[musician.id] || {status:  3}).status,
				    keyName = 'status-item-' + event.id + '-' + musician.id;

				return (
					<StatusItem
						key={keyName}
						id={keyName}
						editMode={this.props.editMode}
						musicianId={musician.id}
						eventId={event.id}
						status={status}
					/>
				);
			});


			return (
				<div
					className="status-column"
					key={"status-column-" + event.id}
				>
					{statusItems}
				</div>
			);
		});

		return (
			<div id="event-table">
				<div id="event-table-header" className="">
					<div ref="eventHeader" id="event-table-head-wrapper">
						{events}
					</div>
				</div>
				<div id="event-table-sidebar">
					<div ref="musicianSidebar" id="event-table-side-wrapper">
						{musicians}
					</div>
				</div>
				<div id="event-table-content" className="">
					{statusColumns}
				</div>
				<div id="event-table-corner"/>
			</div>
		);
	}
});
