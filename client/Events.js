export default class Events {
	constructor() {
		this.listeners = {};
	}

	listen(type, handler) {
		this.listeners[type] || (this.listeners[type] = []);
		this.listeners[type].push(handler);
		return () => {
			this.listeners[type] = this.listeners[type].filter(fn => fn != handler);
		};
	}

	makeMiddleware() {
		return store => next => action => {
			const result = next(action);
			this.trigger(action, store);
			return result;
		};
	}

	trigger(action, store) {
		if (!this.listeners[action.type]) return;

		this.listeners[action.type].forEach(fn => fn(action, store));
	}
}
