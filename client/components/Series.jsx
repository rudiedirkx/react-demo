import React from 'react';
import { createStore, combineReducers } from 'redux';



const seriesRowsReducer = (state = [], action) => {
	switch (action.type) {
		case 'ADD_ROWS':
			return state.concat(action.rows);

		case 'ADD_ROW':
			const {type, ...row} = action;
			return state.concat([row]);

		case 'ROW_WATCHING':
			return state;

		case 'ROW_ACTIVE':
			return state;
	}

	return state;
};
const seriesInactiveReducer = (state = false, action) => {
	if (action.type == 'ADD_ROWS') {
		return !action.active;
	}
	return state;
};
const seriesReducer = combineReducers({
	rows: seriesRowsReducer,
	showingInactive: seriesInactiveReducer,
});
const seriesStore = createStore(seriesReducer);



class SeriesTable extends React.Component {
	constructor(props) {
		super(props);

		this.series = props.series;
		this.unsubscribe = this.series.subscribe(() => this.forceUpdate());

		const loadInitial = this.series.getState().rows.length == 0;
		if (loadInitial) {
			this.loadShows(true);
		}
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	loadShows(active) {
		this.loading = true;
		const url = `series.${active ? 'active' : 'inactive'}.json`;
console.debug(`Loading ${url}`);
console.time(`Loaded ${url}`);
		fetch(url)
			.then(rsp => rsp.json())
			.then(rsp => {
console.timeEnd(`Loaded ${url}`);
				this.series.dispatch({
					type: 'ADD_ROWS',
					rows: rsp.shows.map(show => ({...show, active})),
					active,
				});

				this.loading = false;
			});
	}

	loadMore(e) {
		e.preventDefault();

		e.target.classList.add('loading');
		this.loadShows(false);
	}

	getEmptyMessage() {
		return this.loading ? 'Loading...' : 'No rows...';
	}

	render() {
		const series = this.series.getState();

		let rows = series.rows;
		if (!series.showingInactive) {
			rows = rows.filter(row => row.active);
		}

		return (
			<table>
				<thead>
					<tr>
						<th></th>
						<th>Name</th>
						<th></th>
						<th>Nxt</th>
						<th>Not</th>
						<th>S</th>
						<th colSpan={ 3 }></th>
					</tr>
				</thead>
				<tbody>
					{ rows.length
						&& rows.map(row => <SeriesTableRow key={ row.id } table={ this } {...row} />)
						|| <tr><td colSpan={ 9 }>{ this.getEmptyMessage() }</td></tr>
					}
					{ series.showingInactive
						|| <tr><td colSpan={ 9 }><button onClick={ this.loadMore.bind(this) }>
							LOAD MORE
							<img src="loading16.gif" />
						</button></td></tr>
					}
				</tbody>
			</table>
		);
	}
}

class SeriesTableRow extends React.Component {
	getClassName() {
		var classes = [];
		classes.push(this.props.active ? 'active' : 'inactive');
		this.props.watching && classes.push('watching');

		return classes.join(' ');
	}

	render() {
		return (
			<tr className={ this.getClassName() }>
				<td><TVIcon row={ this } /></td>
				<td>{ this.props.name }</td>
				<td><BannerIcon row={ this } /></td>
				<td></td>
				<td></td>
				<td>{ 1 + parseInt(Math.random() * 6) }</td>
				<td><ActiveIcon row={ this } /></td>
				<td><WatchingIcon row={ this } /></td>
				<td><DownloadIcon row={ this } /></td>
			</tr>
		);
	}
}

class Icon extends React.Component {
	getLabel() {
		return 'x';
	}

	getImage() {
		throw new Error('Must implement getImage()');
	}

	render() {
		return <img src={ this.getImage() } alt={ this.getLabel() } />
	}
}

class TVIcon extends Icon {
	getImage() {
		return 'tvdb.png';
	}
}

class BannerIcon extends Icon {
	constructor(props) {
		super(props);

		this.hasBanner = Math.random() > 0.5;
	}

	getImage() {
		return this.hasBanner ? 'picture.png' : '';
	}

	render() {
		return this.hasBanner ? super.render() : null;
	}
}

class ActiveIcon extends Icon {
	isActive() {
		return this.props.row.props.active;
	}

	getImage() {
		return this.isActive() ? 'yes.gif' : 'delete.png';
	}

	getLabel() {
		return this.isActive() ? 'v' : 'o';
	}
}

class WatchingIcon extends Icon {
	isWatching() {
		return this.props.row.props.watching;
	}

	getImage() {
		return this.isWatching() ? 'arrow_up.png' : 'arrow_down.png';
	}

	getLabel() {
		return this.props.row.props.watching ? 'v' : 'o';
	}
}

class DownloadIcon extends Icon {
	getImage() {
		return 'disk.png';
	}
}

class AddShowForm extends React.Component {
	search(e) {
		e.preventDefault();

		alert('search');
	}

	save(e) {
		e.preventDefault();

		alert('save');
	}

	render() {
		return (
			<form onSubmit={ this.search.bind(this) }>
				<fieldset>
					<legend>Add show</legend>
					<p>Name: <input type="search" /></p>
					<p>
						<button onClick={ this.search.bind(this) }>Search</button>
						{' '}
						<button onClick={ this.save.bind(this) }>Save</button>
					</p>
				</fieldset>
			</form>
		);
	}
}

export default class App extends React.Component {
	render() {
		return (
			<div>
				<SeriesTable series={ seriesStore } />
				<br />
				<AddShowForm />
			</div>
		)
	}
}
