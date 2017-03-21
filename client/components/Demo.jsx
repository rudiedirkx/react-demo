import React from 'react';

const Title = ({color = 'red', children}) => <h1 style={{ color }}>{children}</h1>

export default class Demo extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: '',
			length: 0,
			color: 'green'
		};

		this.updateText = this.updateText.bind(this);
		this.updateColor = this.updateColor.bind(this);
	}

	updateText(e) {
		this.setState({
			title: e.target.value,
			length: e.target.value.length,
		});
	}

	updateColor(e) {
		this.setState({
			color: e.target.value
		});
	}

	render() {
		return (
			<div style={{ textAlign: 'center' }}>
				<Title color={ this.state.color }>Title is { this.state.length || 'zero' } chars long</Title>
				<select onChange={ this.updateColor }><option>green</option><option>red</option><option>blue</option></select>
				<input placeholder="Title..." autoFocus onChange={ this.updateText } />
			</div>
		);
	}
}
