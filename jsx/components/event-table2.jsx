const ReactDOM = require('react-dom');
const React    = require('react');

const StatusItem   = require('./table-items/status-item.jsx');
const MusicianItem = require('./table-items/musician-item.jsx');
const EventItem    = require('./table-items/event-item.jsx');

var EventTable = module.exports = React.createClass({
	componentDidMount() {
		var musicianSidebar = this.refs.musicianSidebar;
		var eventHeader = this.refs.eventHeader;

		this.refs.tableScrollPane.addEventListener('scroll', (event) => {
			var target = event.target;

			musicianSidebar.style.top = -target.scrollTop + 'px';
			eventHeader.style.left    = -target.scrollLeft + 'px';
		});
	},
	render() {
		var events = this.props.events.map( (event) => {
			return (
				<div
					className="event-item"
					key={'event-item-' + event.id}
				>
					{event.title}
					<br/>
					{event.date}
				</div>
			);
		});

		var musicians = this.props.musicians.map( (musician) => {
			var instrumentName = this.props.instruments
			                     .find( instr => instr.id === musician.instrumentId)
			                     .name;

			return (
				<div
					className="musician-item"
					key={'musician-item-' + musician.id}
				>
					{musician.name}
					&nbsp;[{instrumentName}]
				</div>
			);
		});

		var statusColumns = this.props.events.map( (event) => {
			var statusItems = this.props.musicians.map( (musician) => {

				var status  = (event.lineUp[musician.id] || {status:  3}).status,
				    keyName = 'status-item-' + event.id + '-' + musician.id;

				return (
					<div
						className="status-item"
						key={keyName}
					>
						{status}
					</div>
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
				<div id="table-corner"/>
				<div ref="eventHeader" id="event-header" className="">
					{events}
				</div>
				<div ref="musicianSidebar" id="musician-sidebar">
					{musicians}
				</div>
				<div id="table-content-wrapper">
					<div ref="tableScrollPane" id="table-scroll-pane">
						<div id="table-content" className="">
							{statusColumns}
						</div>
					</div>
				</div>
			</div>
		);
	}
});
