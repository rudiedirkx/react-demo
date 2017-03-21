import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './components/Demo.jsx';
import BR from './components/BR.jsx';
import Series from './components/Series.jsx';
import { Router, Route, Redirect, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { createHashHistory } from 'history';

ReactDOM.render((
	<Router history={ createHashHistory() }>
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
			<Route exact path="/" component={ (props) => <Redirect to="/br" /> } />
			<Route exact path="/br" component={ BR } />
			<Route exact path="/demo" component={ Demo } />
			<Route exact path="/series" component={ Series } />
		</div>
	</Router>
), document.getElementById('root'));
