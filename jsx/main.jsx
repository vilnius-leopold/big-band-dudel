'use strict';

const ReactDOM = require('react-dom');
const React    = require('react');

const $         = require('jquery');
const bootstrap = require('bootstrap');

// logic
const eventEmitter = require('./lib/event-emitter.js');
var   dataStore    = require('./lib/dataStore.js');

const emit = function(message, arg1) {
	return eventEmitter.emit.bind(eventEmitter, message, arg1);
};

// components
const AddMusicianPopup   = require('./components/add-musician-popup.jsx');
const AddEventPopup      = require('./components/add-event-popup.jsx');
const AddInstrumentPopup = require('./components/add-instrument-popup.jsx');
const EventTable         = require('./components/event-table2.jsx');

var Icon = React.createClass({
	render() {
		return (
			<span className={"glyphicon glyphicon-" + this.props.type} aria-hidden="true"></span>
		);
	}
});

var ToggleEditButton = React.createClass({
	render() {
		var editMode    = this.props.editMode,
		    activeClass = editMode ? " active" : "",
		    buttonText  = editMode ? "Exit Edit Mode" : "Enter Edit Mode";

		return (
			<button
				className={"btn btn-default pull-right" + activeClass}
				onClick={emit("editMode.change", ! editMode)}
			>
				<Icon type="pencil"/>
				&nbsp;
				{buttonText}
			</button>
		);
	}
});

var App = React.createClass({
	getInitialState() {
		return {
			persistentData: dataStore.data,
			volatileData: {
				editMode: false
			}
		};
	},
	componentDidMount() {
		eventEmitter.on('dataStore.updated', (data) => {
			this.setState({ persistentData: data });
		});

		eventEmitter.on('editMode.change', (data) => {
			this.setState({
				volatileData: {
					editMode: data
				}
			});
		});

		$(this.refs.infoBox).on('close.bs.alert', function () {
			localStorage.setItem('showInfoBox', false);
		});
	},
	render() {
		var volatileData   = this.state.volatileData,
		    persistentData = this.state.persistentData,
		    showInfoBox    = localStorage.getItem('showInfoBox') === "false";

		return (
			<div id="layout">
				<EventTable
					editMode={volatileData.editMode}
					events={persistentData.events}
					musicians={persistentData.musicians}
					instruments={persistentData.instruments}/>
				<AddMusicianPopup
					instruments={persistentData.instruments}
					musicians={persistentData.musicians}/>
				<AddEventPopup
					events={persistentData.events}/>
				<AddInstrumentPopup
					instruments={persistentData.instruments}/>
			</div>
		);
	}
});

ReactDOM.render(
	<App/>,
	document.getElementById('app')
);