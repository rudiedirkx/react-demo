import React from 'react';
import { createStore, combineReducers } from 'redux';



const tableSorterReducer = (state = ['id', 1], action) => {
	switch (action.type) {
		case 'SET_SORTER':
			var dir = state[0] == action.col ? -state[1] : 1;
			return [action.col, dir];
	}

	return state;
};
const tableRowsReducer = (state = [], action) => {
	switch (action.type) {
		case 'DELETE_ROW':
			return state.filter(row => row.id != action.id);

		case 'XABLE_ROW':
			return state.map(row => row.id == action.id ? {...row, enabled: !row.enabled} : row);

		case 'ADD_ROW':
			var {type, ...row} = action;
			return state.concat(row);
	}

	return state;
};
const tableReducer = combineReducers({
	sorter: tableSorterReducer,
	rows: tableRowsReducer,
});
const stores = {
	br: createStore(tableReducer),
	bc: createStore(tableReducer),
};



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

		this.store = props.store;
		this.unserializing = false;
	}

	init() {
		if (this.store.getState().rows.length > 0) {
			this.listen();
			return;
		}

		this.unserializing = true;
		this.unserialize(rows => {
			rows.map(row => this.addRow(row));
			this.unserializing = false;

			this.forceUpdate();
			this.listen();
		});
	}

	listen() {
		this.unsubscribe = this.store.subscribe(() => {
			this.forceUpdate();

			// @todo This is too often. Sort shouldn't save
			this.serialize();
		});
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	unserialize(ready) {
		setTimeout(() => {
			if (!sessionStorage[this.STORAGE_NAME]) {
				sessionStorage[this.STORAGE_NAME] = JSON.stringify(this.defaultRows());
			}

			ready(JSON.parse(sessionStorage[this.STORAGE_NAME]));
		}, this.randomInt(200, 800));
	}

	serialize() {
		const state = this.store.getState();
		sessionStorage[this.STORAGE_NAME] = JSON.stringify(state.rows);
	}

	defaultRows() {
		const numRows = this.randomInt(1, 4);
		return 'x'.repeat(numRows).split('').map((x, index) => this.create(index));
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
		const state = this.store.getState();
		return state.rows.length &&
			state.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 ||
			1;
	}

	setRowEnabled(id, enabled) {
		this.store.dispatch({type: 'XABLE_ROW', id, enabled});
	}

	addRow(row) {
		row || (row = this.create());
		this.store.dispatch({...row, type: 'ADD_ROW'});
	}

	deleteRow(id) {
		this.store.dispatch({type: 'DELETE_ROW', id});
	}

	getRows() {
		const state = this.store.getState();
		const [col, dir] = state.sorter;
		const rows = state.rows;
		rows.sort((a, b) => a[col] > b[col] ? dir * 1 : dir * -1);
		return rows;
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

		this.props.table.store.dispatch({
			type: 'SET_SORTER',
			col: this.props.sorter,
		});
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

export default class App extends React.Component {
	resetStorage(e) {
		delete sessionStorage.BR_br_rows;
		delete sessionStorage.BR_bc_rows;
		document.location.reload();
	}

	render() {
		return (
			<div>
				<button onClick={ this.resetStorage.bind(this) }>RESET</button>

				<h2>Blocked courts</h2>
				<BlockedCourtsTable store={ stores.bc } />

				<h2>Block reservations</h2>
				<BlockReservationsTable store={ stores.br } />
			</div>
		)
	}
}
