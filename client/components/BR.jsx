import React from 'react';

// @todo Redux



window.STORES = {br: 'BR_br_rows', bc: 'BR_bc_rows'};



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






class Table extends React.Component {
	constructor(props) {
		super(props);

		this.serialize = this.serialize.bind(this);
	}

	unserialize() {
		if (!sessionStorage[this.STORAGE_NAME]) {
			sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.defaultRows());
		}

		return JSON.parse(sessionStorage[this.STORAGE_NAME]);
	}

	serialize() {
		sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.state.rows);
	}

	defaultRows() {
		return Array.apply(0, Array(this.randomInt(1, 4))).map((u, index) => this.create(index));
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
		return this.state && this.state.rows &&
			this.state.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 ||
			1;
	}

	setRowEnabled(id, enabled) {
		this.setState({
			rows: this.state.rows.map(row => row.id == id ? {...row, enabled} : row)
		}, this.serialize);
	}

	addRow() {
		this.setState({
			rows: this.state.rows.concat([this.create()])
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
			sorter: [col, dir],
		});
	}

	getEmptyMessage() {
		return 'NO ROWS...';
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

		this.STORAGE_NAME = window.STORES.bc;
		this.state = {sorter: ['id', 1], rows: this.unserialize()};
	}

	create(index) {
		return {
			id: index == null ? this.nextId() : index + 1,
			enabled: this.randomInt(0, 2) == 0,
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

		this.STORAGE_NAME = window.STORES.br;
		this.state = {sorter: ['id', 1], rows: this.unserialize()};
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
		for (let short in window.STORES) sessionStorage.removeItem(window.STORES[short]);
		document.location.reload();
	}

	render() {
		return (
			<div>
				<button onClick={ this.resetStorage.bind(this) }>RESET</button>

				<h2>Blocked courts</h2>
				<BlockedCourtsTable />

				<h2>Block reservations</h2>
				<BlockReservationsTable />
			</div>
		)
	}
}
