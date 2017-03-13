import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import BRApp from './components/BR.jsx';
import SeriesApp from './components/Series.jsx';
import { Router, Route, Redirect, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { createBrowserHistory } from 'history';

ReactDOM.render((
	<Router history={ createBrowserHistory() }>
		<div>
			<p>
				<Link to="/">Home</Link>
				{' '}
				<Link to="/demo">Demo</Link>
				{' '}
				<Link to="/br">BR</Link>
				{' '}
				<Link to="/series">Series</Link>
			</p>
			<Redirect from="/" to="/br" />
			<Route path="/br" component={ BRApp } />
			<Route path="/demo" component={ App } />
			<Route path="/series" component={ SeriesApp } />
		</div>
	</Router>
), document.getElementById('root'));
