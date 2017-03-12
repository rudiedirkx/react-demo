import React from 'react';

class AddRowIcon extends React.Component {
	update(e) {
		e.preventDefault();

		let name = prompt('New name?', '');
		if (!name || !name.trim()) return;

		this.props.table.addRow(name);
	}

	getTitle() {
		return 'Click to add new row';
	}

	render() {
		return (
			<a href="#" onClick={ this.update.bind(this) }>
				<img src="add.png" title={ this.getTitle() } />
			</a>
		)
	}
}

class XabledIcon extends React.Component {
	getTitle() {
		return '' +
			(this.props.enabled ? 'Enabled' : 'Disabled') +
			' - click to ' +
			(this.props.enabled ? 'disable' : 'enable');
	}

	update(e) {
		e.preventDefault();

		this.props.row.setEnabled(!this.props.enabled);
	}

	render() {
		let image = this.props.enabled ? 'enabled.png' : 'disabled.png';
		return (
			<a href="#" onClick={ this.update.bind(this) }>
				<img src={ image } title={ this.getTitle() } />
			</a>
		)
	}
}

class DeleteIcon extends React.Component {
	update(e) {
		e.preventDefault();

		this.props.row.deleteSelf();
	}

	getTitle() {
		return 'Click to delete';
	}

	render() {
		return (
			<a href="#" onClick={ this.update.bind(this) }>
				<img src="delete.png" title={ this.getTitle() } />
			</a>
		)
	}
}

class BlockReservationsTableRow extends React.Component {
	deleteSelf() {
		this.props.table.deleteRow(this.props.id);
	}

	setEnabled(enabled) {
		this.props.table.setRowEnabled(this.props.id, enabled);
	}

	render() {
		return (
			<tr>
				<td><XabledIcon row={ this } { ...this.props } /></td>
				<td>{ this.props.name } ({ this.props.id })</td>
				<td><DeleteIcon row={ this } /></td>
			</tr>
		)
	}
}

class BlockReservationsTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {rows: this.unserialize()};
		this.serialize = this.serialize.bind(this);
	}

	unserialize() {
		if (!sessionStorage.BR_rows) {
			sessionStorage.BR_rows = JSON.stringify([
				{id: 1, enabled: 0, name: 'Oele'},
				{id: 2, enabled: 1, name: 'Boele'},
			]);
		}

		return JSON.parse(sessionStorage.BR_rows);
	}

	serialize() {
console.debug(`${this.state.rows.length} rows`);
		sessionStorage.BR_rows = JSON.stringify(this.state.rows);
	}

	nextId() {
		return this.state.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
	}

	setRowEnabled(id, enabled) {
		this.setState({
			rows: this.state.rows.map(row => row.id == id ? {...row, enabled} : row)
		}, this.serialize);
	}

	addRow(name) {
		this.setState({
			rows: this.state.rows.concat({id: this.nextId(), enabled: 1, name})
		}, this.serialize);
	}

	deleteRow(id) {
		this.setState({
			rows: this.state.rows.filter(row => row.id != id)
		}, this.serialize);
	}

	render() {
		return (
			<table>
				<thead>
					<tr>
						<th></th>
						<th>Name <AddRowIcon table={ this } /></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{this.state.rows.map(row =>
						<BlockReservationsTableRow key={ row.id } table={ this } { ...row } />)}
				</tbody>
			</table>
		)
	}
}

export default class App extends React.Component {
	render() {
		return (
			<BlockReservationsTable />
		)
	}
}
