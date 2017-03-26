import React from 'react';



/**
 * ICONS
 */

class Icon extends React.Component {
	getTitle() {
		throw new Error('must implement getTitle');
	}

	getImage() {
		throw new Error('must implement getImage');
	}

	render() {
		return (
			<a href="#" onClick={ this.update.bind(this) }>
				<img src={ this.getImage() } title={ this.getTitle() } />
			</a>
		)
	}
}

class AddRowIcon extends Icon {
	update(e) {
		e.preventDefault();

		this.props.table.addRow();
	}

	getTitle() {
		return 'Click to add new row';
	}

	getImage() {
		return 'add.png';
	}
}

class XabledIcon extends Icon {
	update(e) {
		e.preventDefault();

		this.props.row.setEnabled(!this.props.enabled);
	}

	getTitle() {
		return '' +
			(this.props.enabled ? 'Enabled' : 'Disabled') +
			' - click to ' +
			(this.props.enabled ? 'disable' : 'enable');
	}

	getImage() {
		return this.props.enabled ? 'enabled.png' : 'disabled.png';
	}
}

class DeleteIcon extends Icon {
	update(e) {
		e.preventDefault();

		if (!this.props.confirm || confirm('Are you very very sure?')) {
			this.props.row.deleteSelf();
		}
	}

	getTitle() {
		return 'Click to delete';
	}

	getImage() {
		return 'delete.png';
	}
}



/**
 * TABLE
 */

class Table extends React.Component {
	constructor(props) {
		super(props);

		this.serialize = this.serialize.bind(this);
		this.unserializing = true;
	}

	unserialize(ready) {
		setTimeout(() => {
			if (!sessionStorage[this.STORAGE_NAME]) {
				sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.defaultRows());
			}

			ready(JSON.parse(sessionStorage[this.STORAGE_NAME]));
			this.updateParent();
		}, this.randomInt(100, 400));
	}

	serialize() {
		if (!this.unserializing) {
			sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.state.rows);
			this.updateParent();
		}
	}

	updateParent() {
		this.props.parent.setState({});
	}

	defaultRows() {
		const numRows = this.randomInt(2, 6);
		return 'xxxxxx'.slice(-numRows).split('').map((x, index) => this.create(index));
	}

	randomWord(ucfirst = false) {
		const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
		let word = words[this.randomInt(0, words.length-1)];
		if (ucfirst) {
			word = word.replace(/^./, m => m.toUpperCase());
		}
		return word;
	}

	randomDate() {
		return '' +
			this.randomInt(2014, 2017) + '-' +
			('0' + this.randomInt(1, 12)).slice(-2) + '-' +
			('0' + this.randomInt(1, 31)).slice(-2);
	}

	randomInt(min, max) {
		return min + Math.floor(Math.random() * (max - min + 1));
	}

	nextId() {
		return this.state.rows.length ?
			this.state.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 :
			1;
	}

	setRowEnabled(id, enabled) {
		this.setState({
			rows: this.state.rows.map(row => row.id == id ? {...row, enabled} : row)
		}, this.serialize);
	}

	addRow(row) {
		row || (row = this.create());
		this.setState({
			rows: this.state.rows.concat([row])
		}, this.serialize);
	}

	deleteRow(id) {
		this.setState({
			rows: this.state.rows.filter(row => row.id != id)
		}, this.serialize);
	}

	getRows() {
		const [col, dir] = this.state.sorter;
		const rows = this.state.rows;
		rows.sort((a, b) => a[col] > b[col] ? dir * 1 : dir * -1);
		return rows;
	}

	sort(col) {
		const dir = this.state.sorter[0] == col ? -this.state.sorter[1] : 1;

		this.setState({
			sorter: [col, dir]
		});
	}

	getEmptyMessage() {
		return this.unserializing ? 'LOADING...' : 'NO ROWS...';
	}

	render() {
		let ROW = this.getRowType();
		let rows = this.getRows();

		return (
			<table>
				<thead>
					{ this.getTHead() }
				</thead>
				<tbody>
					{ rows.length ?
						rows.map(row => <ROW key={ row.id } table={ this } { ...row } />) :
						<tr><td className="empty" colSpan={ ROW.colSpan }>{ this.getEmptyMessage() }</td></tr>
					}
				</tbody>
			</table>
		)
	}
}

class SortableColumn extends React.Component {
	update(e) {
		e.preventDefault();

		this.props.table.sort(this.props.sorter);
	}

	render() {
		return (
			<a href="#" onClick={ this.update.bind(this) }>
				{ this.props.children }
			</a>
		)
	}
}



/**
 * BLOCKED COURTS
 */

class BlockedCourtsTableRow extends React.Component {
	deleteSelf() {
		this.props.table.deleteRow(this.props.id);
	}

	setEnabled(enabled) {
		this.props.table.setRowEnabled(this.props.id, enabled);
	}

	render() {
		return (
			<tr title={ `ID=${this.props.id}` }>
				<td><XabledIcon row={ this } { ...this.props } /></td>
				<td>{ this.props.court }</td>
				<td>{ this.props.start } - { this.props.end }</td>
				<td><DeleteIcon row={ this } /></td>
			</tr>
		)
	}
}
BlockedCourtsTableRow.colSpan = 4;

class BlockedCourtsTable extends Table {
	constructor(props) {
		super(props);

		this.STORAGE_NAME = 'BR_bc_rows';
		this.state = {sorter: ['id', 1], rows: []};
		this.unserialize(rows => {
			this.unserializing = false;
			this.setState({rows});
		});
	}

	create(index) {
		return {
			id: index == null ? this.nextId() : index + 1,
			enabled: this.randomInt(0, 3) > 0,
			court: this.randomWord(true) + ' ' + this.randomInt(1, 6),
			start: this.randomDate(),
			end: this.randomDate(),
		};
	}

	getRowType() {
		return BlockedCourtsTableRow;
	}

	getTHead() {
		return (
			<tr>
				<th><AddRowIcon table={ this } /></th>
				<th><SortableColumn table={ this } sorter="court">Court</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="start">Period</SortableColumn></th>
				<th></th>
			</tr>
		)
	}
}



/**
 * BLOCK RESERVATIONS
 */

class BlockReservationsTableRow extends React.Component {
	deleteSelf() {
		this.props.table.deleteRow(this.props.id);
	}

	setEnabled(enabled) {
		this.props.table.setRowEnabled(this.props.id, enabled);
	}

	render() {
		return (
			<tr title={ `ID=${this.props.id}` }>
				<td><XabledIcon row={ this } { ...this.props } /></td>
				<td>{ this.props.player }</td>
				<td>{ this.props.court }</td>
				<td>{ this.props.start } - { this.props.end }</td>
				<td>{ this.props.reservations }</td>
				<td><DeleteIcon confirm={ true } row={ this } /></td>
			</tr>
		)
	}
}
BlockReservationsTableRow.colSpan = 6;

class BlockReservationsTable extends Table {
	constructor(props) {
		super(props);

		this.STORAGE_NAME = 'BR_br_rows';
		this.state = {sorter: ['id', 1], rows: []};
		this.unserialize(rows => {
			this.unserializing = false;
			this.setState({rows});
		});
	}

	create(index) {
		return {
			id: index == null ? this.nextId() : index + 1,
			enabled: this.randomInt(0, 2) == 0,
			player: this.randomWord(true) + ' ' + this.randomWord(true),
			court: this.randomWord(true) + ' ' + this.randomInt(1, 6),
			start: this.randomDate(),
			end: this.randomDate(),
			reservations: this.randomInt(12, 48),
		};
	}

	getRowType() {
		return BlockReservationsTableRow;
	}

	getTHead() {
		return (
			<tr>
				<th><AddRowIcon table={ this } /></th>
				<th><SortableColumn table={ this } sorter="player">Player</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="court">Court</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="start">Period</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="reservations">Reservations</SortableColumn></th>
				<th></th>
			</tr>
		)
	}
}



/**
 * APP
 */

export default class App extends React.Component {
	resetStorage(e) {
		delete sessionStorage.BR_br_rows;
		delete sessionStorage.BR_bc_rows;
		document.location.reload();
	}

	getSize(store) {
		return this.refs[store] && this.refs[store].state.rows ? this.refs[store].state.rows.length : 0;
	}

	render() {
		return (
			<div>
				<button onClick={ this.resetStorage }>RESET</button>

				<h1>BR records ({ this.getSize('bc') + this.getSize('br') })</h1>

				<h2>Blocked courts ({ this.getSize('bc') })</h2>
				<BlockedCourtsTable ref="bc" parent={ this } />

				<h2>Block reservations ({ this.getSize('br') })</h2>
				<BlockReservationsTable ref="br" parent={ this } />
			</div>
		)
	}
}
