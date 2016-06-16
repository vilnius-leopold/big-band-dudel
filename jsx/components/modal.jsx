const $       = require('jquery');
// const jQuery  = require('jquery');
const moment = require('moment');
const bootstrap = require('bootstrap');

const ReactDOM = require('react-dom');
const React    = require('react');

var Modal = React.createClass({
	componentDidMount() {
		$( this.refs.modal ).modal({
			show: false
		});

		$('#myModal').on('hide.bs.modal', this.props.handleClose);
	},
	componentDidUpdate() {
		$( this.refs.modal ).modal(this.props.show ? 'show' : 'hide');
	},
	render() {
		return (
			<div ref="modal" className="modal bs-example-modal-sm fade" tabindex="-1" role="dialog">
				<div className="modal-dialog modal-sm">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
							<h4 className="modal-title">{this.props.modalTitle}</h4>
						</div>
						<div className="modal-body">
							{this.props.children}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
							<button type="button" onClick={this.props.onConfirm} className="btn btn-primary">Add</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});

module.exports = Modal;