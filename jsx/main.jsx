'use strict';

const ReactDOM = require('react-dom');
const React    = require('react');

const $         = require('jquery');
const bootstrap = require('bootstrap');

// logic
const eventEmitter = require('./lib/event-emitter.js');
const emit         = require('./lib/helpers/emit.js');
const dataStore    = require('./lib/dataStore.js');

// components
const AddMusicianPopup   = require('./components/add-musician-popup.jsx');
const AddEventPopup      = require('./components/add-event-popup.jsx');
const AddInstrumentPopup = require('./components/add-instrument-popup.jsx');
const EventTable         = require('./components/event-table2.jsx');
const Icon               = require('./components/helpers/icon.jsx');


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
			/*
			<div className="container-fluid">
				<br/>
				<div ref="infoBox" className={"alert alert-info alert-dismissible fade in" + (showInfoBox ? " hidden" : "")} role="alert">
					<button type="button" className="close" data-dismiss="alert" aria-label="Close">
						<span aria-hidden="true">×</span>
					</button>
					<Icon type="info-sign"/>
					&nbsp;Participate in improving the dudel by submitting
					<ul>
						<li>feature requests</li>
						<li>bug reports</li>
						<li>questions</li>
					</ul>
					on the <a href="https://github.com/vilnius-leopold/big-band-dudel/issues">GitHub issue tracker</a>.
				</div>
				<div className={"alert alert-success" + (volatileData.editMode ? "" : " invisible")}>
					<Icon type="info-sign"/>
					&nbsp;You are currently in <strong>Edit Mode</strong>
				</div>
				<div className="clearfix">
					<button className="btn btn-default" onClick={emit('openAddMusicianPopup')}>
						Add musician
					</button>&nbsp;
					<button className="btn btn-default" onClick={emit('openAddEventPopup')}>
						Add event
					</button>
					<ToggleEditButton editMode={volatileData.editMode}/>
				</div>
				<br/>

				<footer>
					<a href="https://github.com/vilnius-leopold/big-band-dudel">GitHub Repository</a>
				</footer>
			</div>
			*/

			<div id="layout">
				<header className="container-fluid">
					<div ref="infoBox" className={"alert alert-info alert-dismissible fade in" + (showInfoBox ? " hidden" : "")} role="alert">
						<button type="button" className="close" data-dismiss="alert" aria-label="Close">
							<span aria-hidden="true">×</span>
						</button>
						<Icon type="info-sign"/>
						&nbsp;Participate in improving the dudel by submitting
						<ul>
							<li>feature requests</li>
							<li>bug reports</li>
							<li>questions</li>
						</ul>
						on the <a href="https://github.com/vilnius-leopold/big-band-dudel/issues">GitHub issue tracker</a>.
					</div>
					<div className={"alert alert-success" + (volatileData.editMode ? "" : " invisible")}>
						<Icon type="info-sign"/>
						&nbsp;You are currently in <strong>Edit Mode</strong>
					</div>
					<div className="clearfix">
						<button className="btn btn-default" onClick={emit('openAddMusicianPopup')}>
							Add musician
						</button>&nbsp;
						<button className="btn btn-default" onClick={emit('openAddEventPopup')}>
							Add event
						</button>
						<ToggleEditButton editMode={volatileData.editMode}/>
					</div>
				</header>
				<EventTable
					editMode={volatileData.editMode}
					events={persistentData.events}
					musicians={persistentData.musicians}
					instruments={persistentData.instruments}/>
				<footer className="container-fluid">
					<a href="https://github.com/vilnius-leopold/big-band-dudel">GitHub Repository</a>
				</footer>
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