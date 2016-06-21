const React    = require('react');

var Icon = module.exports = React.createClass({
	render() {
		var className =
			"glyphicon glyphicon-" +
			this.props.type + " " +
			this.props.className +
			(this.props.show ? "" : " invisible");

		return (
			<span
				className={className}
				aria-hidden="true"
				onClick={this.props.onClick}
			></span>
		);
	}
});