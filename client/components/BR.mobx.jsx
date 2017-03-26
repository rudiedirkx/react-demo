import React from 'react';
import { autorun, observable, computed } from 'mobx';
import { observer } from 'mobx-react';



class TableStore {
	exists = false;

	@observable rows = [];
	@observable sorter = ['id', 1];

	@computed get sortedRows() {
		const [col, dir] = this.sorter;
		const rows = this.rows;
		return rows.sort((a, b) => a[col] > b[col] ? dir : -dir);
	}

	setSorter(col) {
		var dir = this.sorter[0] == col ? -this.sorter[1] : 1;
		this.sorter = [col, dir];
	}

	deleteRow(id) {
		this.rows = this.rows.filter(row => row.id != id);
	}

	xableRow(id) {
		this.rows = this.rows.map(row => row.id == id ? {...row, enabled: !row.enabled} : row);
	}

	addRow(row) {
		this.rows.push(row);
	}
}
const stores = {
	br: new TableStore,
	bc: new TableStore,
};



/**
 * ICONS
 */

@observer class Icon extends React.Component {
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

@observer class AddRowIcon extends Icon {
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

@observer class XabledIcon extends Icon {
	update(e) {
		e.preventDefault();

		this.props.row.setEnabled();
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

@observer class DeleteIcon extends Icon {
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

@observer class Table extends React.Component {
	constructor(props) {
		super(props);

		this.store = props.store;
		this.unserializing = true;
	}

	init() {
		if (this.store.exists) {
			return;
		}

		this.store.exists = true;
		this.unserialize(rows => {
			rows.map(row => this.addRow(row));
			this.unserializing = false;
		});
	}

	unserialize(ready) {
		setTimeout(() => {
			if (!sessionStorage[this.STORAGE_NAME]) {
				sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.defaultRows());
			}

			ready(JSON.parse(sessionStorage[this.STORAGE_NAME]));
		}, this.randomInt(100, 400));
	}

	serialize() {
		if (!this.unserializing) {
			sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.store.rows);
		}
	}

	defaultRows() {
		const numRows = this.randomInt(1, 4);
		return 'xxxx'.slice(-numRows).split('').map((x, index) => this.create(index));
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
		return this.store.rows.length &&
			this.store.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 ||
			1;
	}

	setRowEnabled(id) {
		this.store.xableRow(id);
		this.serialize();
	}

	addRow(row) {
		row || (row = this.create());
		this.store.addRow(row);
		this.serialize();
	}

	deleteRow(id) {
		this.store.deleteRow(id);
		this.serialize();
	}

	getEmptyMessage() {
		return this.unserializing ? 'LOADING...' : 'NO ROWS...';
	}

	render() {
		const ROW = this.getRowType();
		const rows = this.store.sortedRows;

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

@observer class SortableColumn extends React.Component {
	update(e) {
		e.preventDefault();

		this.props.table.store.setSorter(this.props.sorter);
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

@observer class BlockedCourtsTableRow extends React.Component {
	deleteSelf() {
		this.props.table.deleteRow(this.props.id);
	}

	setEnabled() {
		this.props.table.setRowEnabled(this.props.id);
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

@observer class BlockedCourtsTable extends Table {
	constructor(props) {
		super(props);

		this.STORAGE_NAME = 'BR_bc_rows';
		this.init();
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

@observer class BlockReservationsTableRow extends React.Component {
	deleteSelf() {
		this.props.table.deleteRow(this.props.id);
	}

	setEnabled() {
		this.props.table.setRowEnabled(this.props.id);
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

@observer class BlockReservationsTable extends Table {
	constructor(props) {
		super(props);

		this.STORAGE_NAME = 'BR_br_rows';
		this.init();
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

export default @observer class App extends React.Component {
	resetStorage(e) {
		delete sessionStorage.BR_br_rows;
		delete sessionStorage.BR_bc_rows;
		document.location.reload();
	}

	render() {
		return (
			<div>
				<button onClick={ this.resetStorage }>RESET</button>

				<h1>BR records ({ stores.bc.rows.length + stores.br.rows.length })</h1>

				<h2>Blocked courts ({ stores.bc.rows.length })</h2>
				<BlockedCourtsTable store={ stores.bc } />

				<h2>Block reservations ({ stores.br.rows.length })</h2>
				<BlockReservationsTable store={ stores.br } />
			</div>
		)
	}
}
