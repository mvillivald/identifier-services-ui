/**
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this file.
 *
 * UI microservice of Identifier Services
 *
 * Copyright (C) 2019 University Of Helsinki (The National Library Of Finland)
 *
 * This file is part of identifier-services-ui
 *
 * identifier-services-ui program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * identifier-services-ui is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this file.
 *
 */
import fetch from 'node-fetch';
import XLSX from 'xlsx';
import {LOADER, LOADER_DONE, LIST_LOADER, GET_CAPTCHA, ERROR, SET_FORM_NAME, SNACKBAR_MESSAGE, GET_NOTIFICATION, RANGE_LIST_LOADER, SEARCH_LIST_LOADER, PUBLICATION_LOADER} from './types';

export function success(type, payload) {
	return ({
		type: type,
		payload: payload
	});
}

export function fail(type, payload) {
	return ({
		type: type,
		payload: payload
	});
}

export const setLoader = () => {
	return {
		type: LOADER
	};
};

export const setLoadingDone = () => {
	return {
		type: LOADER_DONE
	};
};

export const setPublicationLoader = () => {
	return {
		type: PUBLICATION_LOADER
	};
};

export const setListLoader = () => {
	return {
		type: LIST_LOADER
	};
};

export const setSearchListLoader = () => {
	return {
		type: SEARCH_LIST_LOADER
	};
};

export const setRangeListLoader = () => {
	return {
		type: RANGE_LIST_LOADER
	};
};

export const loadSvgCaptcha = () => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch('/captcha', {
			method: 'GET'
		});
		const result = await response.json();
		dispatch(success(GET_CAPTCHA, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const postCaptchaInput = (inputData, id) => async dispatch => {
	const body = {
		captchaInput: inputData,
		id
	};
	dispatch(setLoader());
	try {
		const response = await fetch('/captcha', {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		});
		const result = await response.json();
		return result;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const setFormName = value => {
	return {
		type: SET_FORM_NAME,
		payload: value
	};
};

export const setMessage = value => {
	return {
		type: SNACKBAR_MESSAGE,
		payload: value
	};
};

export const getNotification = () => async dispatch => {
	try {
		const response = await fetch('/notification', {
			method: 'GET'
		});
		const result = await response.json();
		return dispatch({
			type: GET_NOTIFICATION,
			payload: result
		});
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const exportXLS = (wbout, dataToDownload) => dispatch => {
	try {
		XLSX.utils.book_append_sheet(wbout, dataToDownload, 'statistics');
		XLSX.writeFile(wbout, 'statistics.xml', {bookType: 'xlsx', type: 'file'});
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};
