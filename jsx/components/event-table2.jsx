const ReactDOM = require('react-dom');
const React    = require('react');

const StatusItem   = require('./table-items/status-item.jsx');
const MusicianItem = require('./table-items/musician-item.jsx');
const EventItem    = require('./table-items/event-item.jsx');

var EventTable = module.exports = React.createClass({
	componentDidMount() {
		var musicianSidebar = this.refs.musicianSidebar,
		    eventHeader     = this.refs.eventHeader,
		    tableScrollPane = this.refs.tableScrollPane;

		var panLeftPanelHidden  = null,
		    panRightPanelHidden = null;

		// initialize
		if ( tableScrollPane.scrollLeft === 0 ) {
			this.refs.panLeftPanel.style.display = 'none';
			panLeftPanelHidden = true;
		} else {
			this.refs.panLeftPanel.style.display = 'block';
			panLeftPanelHidden = false;
		}

		if ( tableScrollPane.scrollLeft === tableScrollPane.scrollLeftMax ){
			this.refs.panRightPanel.style.display = 'none';
			panRightPanelHidden = true;
		} else if ( panRightPanelHidden ) {
			this.refs.panRightPanel.style.display = 'block';
			panRightPanelHidden = false;
		}

		// listen to scroll event
		tableScrollPane.addEventListener('scroll', (event) => {
			var target     = event.target,
			    scrollLeft = target.scrollLeft,
			    scrollTop  = target.scrollTop;

			musicianSidebar.style.top = -scrollTop  + 'px';
			eventHeader.style.left    = -scrollLeft + 'px';

			if ( scrollLeft === 0 ) {
				this.refs.panLeftPanel.style.display = 'none';
				panLeftPanelHidden = true;
			} else if ( panLeftPanelHidden ) {
				this.refs.panLeftPanel.style.display = 'block';
				panLeftPanelHidden = false;
			}

			if (scrollLeft === target.scrollLeftMax){
				this.refs.panRightPanel.style.display = 'none';
				panRightPanelHidden = true;
			} else if ( panRightPanelHidden ) {
				this.refs.panRightPanel.style.display = 'block';
				panRightPanelHidden = false;
			}

		});

		// add interaction
		this.refs.panRightPanel.addEventListener('click', (event) => {
			var currentScrollLeft = tableScrollPane.scrollLeft;
			tableScrollPane.scrollLeft = currentScrollLeft + 140;
		});

		this.refs.panLeftPanel.addEventListener('click', (event) => {
			var currentScrollLeft = tableScrollPane.scrollLeft;
			tableScrollPane.scrollLeft = currentScrollLeft - 140;
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
				<div ref="eventHeader" id="event-table-header" className="">
					<div id="event-table-corner"/>
					<div id="event-table-head-wrapper">
						{events}
					</div>
				</div>
				<div ref="musicianSidebar" id="event-table-sidebar">
					<div id="event-table-side-wrapper">
						{musicians}
					</div>
				</div>
				<div id="event-table-content" className="">
					{statusColumns}
				</div>
			</div>
		);
	}
});
