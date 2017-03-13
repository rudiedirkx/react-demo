import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import BRApp from './components/BR.jsx';
import SeriesApp from './components/Series.jsx';
import { Router, Route, Redirect } from 'react-router';
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
			<Route exact path="/">
				<Redirect to="/br" />
			</Route>
			<Route exact path="/demo" component={ App } />
			<Route exact path="/br" component={ BRApp } />
			<Route exact path="/series" component={ SeriesApp } />
		</div>
	</Router>
), document.getElementById('root'));
