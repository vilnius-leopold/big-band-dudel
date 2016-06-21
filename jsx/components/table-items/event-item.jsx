const React    = require('react');
const ReactDOM = require('react-dom');
const moment   = require('moment');

const $       = require('jquery');
const bootstrap = require('bootstrap');

const eventEmitter = require('./../../lib/event-emitter.js');
const EventPopover = require('./../popovers/event-popover.jsx');

var EventItem = module.exports = React.createClass({
	removeEvent() {
		eventEmitter.emit('removeEvent', this.props.eventId);
	},
	componentDidMount() {
		var containerSelector = 'popover-container-' + this.props.eventId;

		this.popoverObj = $(this.refs.eventHeading).popover({
			container: 'body',
			html: true,
			content: '<div id="'+containerSelector+'">Loading...</div>',
			placement: 'bottom',
			title: 'Line up',
			trigger: 'manual'
		});

		this.popoverObj.on('inserted.bs.popover', () => {
			ReactDOM.render(
				<EventPopover eventId={this.props.eventId}/>,
				document.querySelector('#' + containerSelector)
			);
		}).on('shown.bs.popover', () => {
			// eventEmitter.emit('event.popover.show', this.props.eventId);
			var handler = () => {
				this.popoverObj.popover('hide');
				window.removeEventListener('click', handler);
			};

			window.addEventListener('click', handler);
		}).on('show.bs.popover', () => {
			this.popOverOpen = true;
		}).on('hide.bs.popover', () => {
			this.popOverOpen = false;
		});
	},
	openPopover() {
		if ( this.popOverOpen ) {
			this.popoverObj.popover('hide');

		} else {
			if ( ! this.props.editMode )
				this.popoverObj.popover('show');
		}
	},
	render() {
		return (
			<div
				ref="eventHeading"
				onClick={this.openPopover}
				data-toggle="popover"
				className="table-event-item"
			>
				<div className="event-title">
					{this.props.title}
				</div>
				<div className="event-options">
					<span
						className={"remove-button glyphicon glyphicon-trash" + (this.props.editMode ? "" : " invisible")}
						aria-hidden="true"
						onClick={this.removeEvent}
					></span>
				</div>
				<div className="event-date">
					{moment(this.props.date).format("DD.MM.YYYY")}
				</div>
			</div>
		);
	}
});