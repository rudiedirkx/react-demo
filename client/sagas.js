import {call, put, takeEvery, takeLatest} from 'redux-saga/effects';
import API from './API.js';

function* fetchRows(action) {
	// console.log('fetchRows', action);
	try {
		const rows = yield call(API.fetchRows, action.storage);
		console.log('fetchRows', 'OK', rows);
		yield put({type: "FETCH_ROWS_OK", rows});
	}
	catch (e) {
		console.log('fetchRows', 'NOK', e);
		yield put({type: "ERROR", error: e.message || e});
	}
}

// function* fetchRowsError(action) {
// 	console.log(action.error);
// }

export default function*() {
	yield takeEvery('FETCH_ROWS', fetchRows);
	// yield takeEvery('FETCH_ROWS_NOK', fetchRowsError);
}
