import React from 'react';

class Tabs extends React.Component {
	constructor(props) {
		super(props);

		const children = React.Children.toArray(props.children);
		const activeChild = children.find(child => child.props.active) || children[0];
		this.state = {
			active: activeChild.props.name,
		};
	}

	focusTab(tab, e) {
		e.preventDefault();

		this.setState({
			active: tab.props.name,
		});
	}

	getLinkClass(tab) {
		return tab.props.name == this.state.active ? 'active' : null;
	}

	getTabClass(tab) {
		return tab.props.name == this.state.active ? 'tab active' : 'tab';
	}

	render() {
		return (
			<div>
				<ul>
					{ React.Children.map(this.props.children, tab =>
						<li className={ this.getLinkClass(tab) } key={ tab }>
							<a onClick={ this.focusTab.bind(this, tab) } href="#">{ tab.props.name }</a>
						</li>
					) }
				</ul>

				{ React.Children.map(this.props.children, tab =>
					<div className={ this.getTabClass(tab) } key={ tab }>{ tab.props.children }</div>
				) }
			</div>
		);
	}
}

class Tab extends React.Component {
	render() {
		return (
			<div>{ this.props.children }</div>
		);
	}
}

export default class TabsApp extends React.Component {
	render() {
		return (
			<div>
				<Tabs>
					<Tab name="About ✅">
						<p>About us etc</p>
						<p>More about us</p>
					</Tab>
					<Tab name="Contact">
						<p>Contact us here</p>
					</Tab>
					<Tab name="Disclaimer">
						<p>We're not responsible etc</p>
					</Tab>
				</Tabs>
			</div>
		);
	}
}
