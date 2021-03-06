import React from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import Events from '../Events';

const events = new Events();
const evMiddle = events.makeMiddleware();

const INITIAL_SORT = ['id', 1];

const tableNameReducer = (state = '', action) => {
	// console.log('tableNameReducer', action);
	switch (action.type) {
		case 'SET_NAME':
			return action.name;
	}

	return state;
};
const tableSorterReducer = (state = INITIAL_SORT, action) => {
	// console.log('tableSorterReducer', action);
	switch (action.type) {
		case 'SET_SORTER':
			var dir = state[0] == action.col ? -state[1] : 1;
			return [action.col, dir];
		case 'RESET_SORTER':
			return INITIAL_SORT;
	}

	return state;
};
const tableRowsReducer = (state = [], action) => {
	// console.log('tableRowsReducer', action);
	switch (action.type) {
		case 'CLEAR':
			return [];

		case 'DELETE_ROW':
			return state.filter(row => row.id != action.id);

		case 'XABLE_ROW':
			return state.map(row => row.id == action.id ? {...row, enabled: !row.enabled} : row);

		case 'ADD_ROW':
			var {type, ...row} = action;
			return state.concat(row);

		case 'SET_ROWS':
			return action.rows;
	}

	return state;
};
const tableReducer = combineReducers({
	name: tableNameReducer,
	sorter: tableSorterReducer,
	rows: tableRowsReducer,
});
const stores = {
	br: createStore(tableReducer, applyMiddleware(evMiddle)),
	bc: createStore(tableReducer, applyMiddleware(evMiddle)),
};

stores.br.dispatch({type: 'SET_NAME', name: 'br'});
stores.bc.dispatch({type: 'SET_NAME', name: 'bc'});


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

class RefreshTableIcon extends Icon {
	update(e) {
		e.preventDefault();

		this.props.table.reinit();
	}

	getTitle() {
		return 'Click to refresh content';
	}

	getImage() {
		return 'refresh.png';
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
			this.setRows(rows);
			this.unserializing = false;

			this.forceUpdate();
			this.listen();
		});
	}

	reinit() {
		this.unsubscribe && this.unsubscribe();
		this.store.dispatch({type: 'CLEAR'});
		// this.store.dispatch({type: 'RESET_SORTER'});
		this.init();
	}

	listen() {
		this.unsubscribe = this.store.subscribe(() => {
			this.forceUpdate();
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
		}, this.randomInt(400, 800));
	}

	serialize() {
		if (!this.unserializing) {
			const state = this.store.getState();
			sessionStorage[this.STORAGE_NAME] = JSON.stringify(state.rows);
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
		const state = this.store.getState();
		return state.rows.length &&
			state.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1 ||
			1;
	}

	setRowEnabled(id, enabled) {
		this.store.dispatch({type: 'XABLE_ROW', id, enabled});
		this.serialize();
	}

	addRow(row) {
		row || (row = this.create());
		this.store.dispatch({...row, type: 'ADD_ROW'});
		this.serialize();
	}

	setRows(rows) {
		this.store.dispatch({rows, type: 'SET_ROWS'});
	}

	deleteRow(id) {
		this.store.dispatch({type: 'DELETE_ROW', id});
		this.serialize();
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
				<th><RefreshTableIcon table={ this } /></th>
				<th><SortableColumn table={ this } sorter="court">Court</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="start">Period</SortableColumn></th>
				<th><AddRowIcon table={ this } /></th>
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
				<th><RefreshTableIcon table={ this } /></th>
				<th><SortableColumn table={ this } sorter="player">Player</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="court">Court</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="start">Period</SortableColumn></th>
				<th><SortableColumn table={ this } sorter="reservations">Reservations</SortableColumn></th>
				<th><AddRowIcon table={ this } /></th>
			</tr>
		)
	}
}



/**
 * APP
 */

export default class App extends React.Component {
	constructor(...args) {
		super(...args);

		this.unsub = [];
	}

	componentDidMount() {
console.log('componentDidMount');
		const upd = () => this.forceUpdate();
		this.unsub.push(stores.bc.subscribe(upd));
		this.unsub.push(stores.br.subscribe(upd));

		events.listen('ADD_ROW', (action, store) => {
			const state = store.getState();
			const rows = state.rows.length;
			const name = state.name;
			if ( rows >= 5 ) {
				setTimeout(() => alert(`Ooeeh ${name} is on fire!`), 100);
			}
		});
	}

	componentWillUnmount() {
console.log('componentWillUnmount');
		this.unsub.forEach(unsub => unsub());
		stores.bc.dispatch({type: 'CLEAR'});
		stores.br.dispatch({type: 'CLEAR'});
	}

	resetStorage(e) {
		delete sessionStorage.BR_br_rows;
		delete sessionStorage.BR_bc_rows;
		document.location.reload();
	}

	render() {
		return (
			<div>
				<button onClick={ this.resetStorage }>RESET</button>

				<h1>BR records ({ stores.bc.getState().rows.length + stores.br.getState().rows.length })</h1>

				<h2>Blocked courts ({ stores.bc.getState().rows.length })</h2>
				<BlockedCourtsTable store={ stores.bc } />

				<h2>Block reservations ({ stores.br.getState().rows.length })</h2>
				<BlockReservationsTable store={ stores.br } />
			</div>
		)
	}
}
