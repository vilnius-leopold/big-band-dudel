const $       = require('jquery');
// const jQuery  = require('jquery');
const moment = require('moment');
const bootstrap = require('bootstrap');

const ReactDOM = require('react-dom');
const React    = require('react');

const eventEmitter = require('./../lib/event-emitter.js');

var Modal = React.createClass({
	getInitialState() {
		return {
			errorMessages: null
		}
	},
	componentDidMount() {
		this.modalObj = $( this.refs.modal );

		this.modalObj.modal({
			show: false
		});

		this.modalObj
			.on('show.bs.modal'  , () => {
				this.setState(this.getInitialState());
				this.props.onShow();
			})
			.on('shown.bs.modal' , this.props.onShown)
			.on('hide.bs.modal'  , this.props.onClose)
			.on('hidden.bs.modal', this.props.onClosed);

		eventEmitter.on(this.props.triggerEvent, ( data ) => {
			this.modalObj.modal('show');

			if ( this.props.onTrigger )
				this.props.onTrigger(data);
		});
	},
	onConfirm() {
		var errorMessages = this.props.onConfirm();

		if ( ! errorMessages ) {
			this.modalObj.modal('hide');
		}

		this.setState({errorMessages: errorMessages});
	},
	render() {
		var alerts = (this.state.errorMessages || []).map( (errorMessage, i) => {
			return (
				<div key={i} className={"alert alert-danger"}>
					<span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
					&nbsp;<span dangerouslySetInnerHTML={{__html: errorMessage}} />.
				</div>
			);
		});

		return (
			<div ref="modal" className="modal bs-example-modal-sm fade" tabindex="-1" role="dialog">
				<div className="modal-dialog modal-sm">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 className="modal-title">{this.props.modalTitle}</h4>
						</div>
						<div className="modal-body">
							{alerts}
							{this.props.children}
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-default"
								data-dismiss="modal"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={this.onConfirm}
								className="btn btn-primary"
							>
								{this.props.submitButton ? this.props.submitButton : "Add"}
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = Modal;