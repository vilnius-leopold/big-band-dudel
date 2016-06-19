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

		// var index = dataStore.events.findIndex( (e) => {
		// 	return e.id === this.props.eventId;
		// });

		// dataStore.events.splice(index, 1);

		// updateApp();
		// updateRemoteStore()
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
			console.log('inserted event');
			ReactDOM.render(
				<EventPopover eventId={this.props.eventId}/>,
				document.querySelector('#' + containerSelector)
			);
		}).on('shown.bs.popover', () => {
			console.log('shown event');
			// eventEmitter.emit('event.popover.show', this.props.eventId);
			var handler = () => {
				console.log('hide event');
				this.popoverObj.popover('hide');
				window.removeEventListener('click', handler);
			};

			window.addEventListener('click', handler);
		}).on('show.bs.popover', () => {
			this.popOverOpen = true;
		}).on('hide.bs.popover', () => {
			this.popOverOpen = false;
		});


		// eventEmitter.on('event.popover.show', (eventId) => {
		// 	if ( this.props.eventId !== eventId ) {
		// 		popoverObj.popover('hide');
		// 	}
		// });
	},
	openPopover() {
		if ( this.popOverOpen ) {
			this.popoverObj.popover('hide');

		} else {
			this.popoverObj.popover('show');
		}
		console.log('click event');
	},
	render() {
		return (
			<th
				ref="eventHeading"
				onClick={this.openPopover}
				data-toggle="popover"
				className="table-event-item"
			>
				{this.props.title}
				&nbsp;<span
					className={"remove-button glyphicon glyphicon-trash" + (this.props.editMode ? "" : " invisible")}
					aria-hidden="true"
					onClick={this.removeEvent}
				></span>

				<br />
				{moment(this.props.date).format("DD.MM.YYYY")}
			</th>
		);
	}
});