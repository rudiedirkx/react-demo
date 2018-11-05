export default {
	fetchRows(storage) {
// console.log('API.fetchRows 1');
		return new Promise((resolve, reject) => {
// console.log('API.fetchRows 2');
			setTimeout(() => {
// console.log('API.fetchRows 3');
				if (Math.random() < .3) {
					return reject('Some error');
				}

				if (!sessionStorage[storage]) {
					sessionStorage[storage] = JSON.stringify([]);
				}

				resolve(JSON.parse(sessionStorage[storage]));
			}, 400 + 400 * Math.random());
		})
	}
};
