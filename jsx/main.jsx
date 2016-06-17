'use strict';

const ReactDOM = require('react-dom');
const React    = require('react');

// logic
const eventEmitter       = require('./lib/event-emitter.js');
var   dataStore          = require('./lib/dataStore.js');

// components
const AddMusicianPopup   = require('./components/add-musician-popup.jsx');
const AddEventPopup      = require('./components/add-event-popup.jsx');
const AddInstrumentPopup = require('./components/add-instrument-popup.jsx');
const EventTable         = require('./components/event-table.jsx');

var AddInstrumentButton = React.createClass({
	handleClick() {
		eventEmitter.emit('openAddInstrumentPopup');
	},
	render() {
		return (
			<button
				className="btn btn-default"
				onClick={this.handleClick}
			>
				Add new instrument
			</button>
		);
	}
});

var AddMusicianButton = React.createClass({
	handleClick() {
		eventEmitter.emit('openAddMusicianPopup');
	},
	render() {
		return (
			<button
				className="btn btn-default"
				onClick={this.handleClick}
			>
				Add musician
			</button>
		);
	}
});

var AddEventButton = React.createClass({
	handleClick() {
		eventEmitter.emit('openAddEventPopup');
	},
	render() {
		return (
			<button
				className="btn btn-default"
				onClick={this.handleClick}
			>
				Add event
			</button>
		);
	}
});

var ToggleEditButton = React.createClass({
	handleClick(){
		eventEmitter.emit("editMode.change", ! this.props.editMode);
	},
	render() {
		return (
			<button
				className={"btn btn-default pull-right" + (this.props.editMode ? " active" : "")}
				onClick={this.handleClick}
			>
				<span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
				&nbsp;{this.props.editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
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
	},
	render() {
		return (
			<div className="container">
				<h1>Big Band Dudel</h1>
				<div className="alert alert-info">
					<span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
					&nbsp;Participate in improving the dudel by submitting
					<ul>
						<li>feature requests</li>
						<li>bug reports</li>
						<li>questions</li>
					</ul>
					on the <a href="https://github.com/vilnius-leopold/big-band-dudel/issues">GitHub issue tracker</a>.
				</div>
				<div className={"alert alert-success" + (this.state.volatileData.editMode ? "" : " invisible")}>
					<span className="glyphicon glyphicon-info-sign" aria-hidden="true"></span>
					&nbsp;You are currently in <strong>Edit Mode</strong>
				</div>
				<div className="clearfix">
					<AddMusicianButton/>&nbsp;
					<AddEventButton/>
					<ToggleEditButton editMode={this.state.volatileData.editMode}/>
				</div>
				<br/>
				<EventTable
					editMode={this.state.volatileData.editMode}
					events={this.state.persistentData.events}
					musicians={this.state.persistentData.musicians}
					instruments={this.state.persistentData.instruments}
				/>
				<AddMusicianPopup
					instruments={this.state.persistentData.instruments}
					musicians={this.state.persistentData.musicians}
				/>
				<AddEventPopup
					events={this.state.persistentData.events}
				/>
				<AddInstrumentPopup
					instruments={this.state.persistentData.instruments}
				/>
				<footer>
					<a href="https://github.com/vilnius-leopold/big-band-dudel">GitHub Repository</a>
				</footer>
			</div>
		);
	}
});

ReactDOM.render(
	<App/>,
	document.getElementById('app')
);