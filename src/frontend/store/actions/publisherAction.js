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

/* global API_URL */
/* eslint no-undef: "error" */
import fetch from 'node-fetch';
import {createIntl, createIntlCache} from 'react-intl';
import enMessages from '../../intl/translations/en.json';
import fiMessages from '../../intl/translations/fi.json';
import svMessages from '../../intl/translations/sv.json';
import {PUBLISHER, PUBLISHERS_LIST, UPDATE_PUBLISHER, ERROR, SEARCH_PUBLISHER, PUBLISHER_OPTIONS, PUBLISHERS_REQUESTS_LIST, PUBLISHER_REQUEST, UNIVERSITY_PUBLISHER} from './types';
import {setLoader, setListLoader, setMessage, success, fail, setSearchListLoader} from './commonAction';
import HttpStatus from 'http-status';

const translations = {
	fi: fiMessages,
	en: enMessages,
	sv: svMessages
};

const cache = createIntlCache();

export const fetchPublisher = (id, token) => async dispatch => {
	dispatch(setListLoader());
	try {
		const response = await fetch(`${API_URL}/publishers/${id}`, {
			method: 'GET',
			headers: token ? {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			} :
				{'Content-Type': 'application/json'}
		});
		const result = await response.json();
		dispatch(success(PUBLISHER, result));
		return result;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const updatePublisher = (id, values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/publishers/${id}`, {
			method: 'PUT',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});
		if (response.status === HttpStatus.OK) {
			const result = await response.json();
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Publisher updated'})}));
			dispatch(success(UPDATE_PUBLISHER, result.value));
		} else {
			dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'Request update unsuccessful'})}));
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchPublisherOption = token => async dispatch => {
	try {
		const properties = {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`
			}
		};
		const response = await fetch(`${API_URL}/publishers/query/all`, properties);
		const result = await response.json();
		dispatch(success(PUBLISHER_OPTIONS, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const searchPublisher = ({searchText, token, activeCheck, sort}) => async dispatch => {
	dispatch(setSearchListLoader());
	const query = activeCheck !== undefined &&
		activeCheck.filterByIdentifier === true ? {publisherIdentifier: searchText} :
		activeCheck.checked === true ? {$or: [{name: searchText}, {aliases: searchText}, {email: searchText}], activity: {active: true}, selfPublisher: false} :
			activeCheck.selfPublishers === true ? {$or: [{name: searchText}, {aliases: searchText}, {email: searchText}], activity: {active: true}, selfPublisher: false, publisherType: 'T'} :
				{$or: [{name: searchText}, {aliases: searchText}, {email: searchText}], selfPublisher: false};
	try {
		const properties = {
			method: 'POST',
			headers: token ? {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			} :
				{'Content-Type': 'application/json'},
			body: JSON.stringify({
				queries: [{
					query: query
				}],
				sort: sort
			})
		};

		const response = await fetch(`${API_URL}/publishers/query`, properties);

		const result = await response.json();
		dispatch(success(SEARCH_PUBLISHER, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const getUniversityPublisher = () => async dispatch => {
	dispatch(setListLoader());
	const query = {publisherType: 'university'};
	try {
		const response = await fetch(`${API_URL}/publishers/query`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(UNIVERSITY_PUBLISHER, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

// ****************REQUESTS**********************************
export const publisherCreationRequest = values => async () => {
	const response = await fetch('/requests/publishers', {
		method: 'POST',
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});

	if (response.status === HttpStatus.CREATED) {
		return response.status;
	}
};

export const fetchPublishersRequestsList = ({searchText, token, sortStateBy, sort}) => async dispatch => {
	dispatch(setListLoader());
	try {
		const response = await fetch(`${API_URL}/requests/publishers/query`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {state: sortStateBy, name: searchText}
				}],
				sort: sort
			})
		});
		const result = await response.json();
		dispatch(success(PUBLISHERS_REQUESTS_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchPublisherRequest = (id, token) => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/requests/publishers/${id}`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});
		const result = await response.json();
		dispatch(success(PUBLISHER_REQUEST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const updatePublisherRequest = (id, values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	dispatch(setLoader());
	try {
		delete values.backgroundProcessingState;
		const response = await fetch(`${API_URL}/requests/publishers/${id}`, {
			method: 'PUT',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});
		if (response.status === HttpStatus.OK) {
			const result = await response.json();
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Publisher Request updated'})}));
			dispatch(success(PUBLISHER_REQUEST, result.value));
		} else {
			dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'Request update unsuccessful'})}));
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchAllPublishers = ({identifierType, type, token}) => async dispatch => {
	dispatch(setListLoader());
	try {
		const query = type && identifierType ?
			{query: {identifierType: identifierType.toLowerCase(), type}} :
			(identifierType ?
				{query: {identifierType: identifierType.toLowerCase()}} :
				type ?
					{query: {type}} :
					{query: {}}
			);
		const properties = {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(query)
		};
		const response = await fetch(`${API_URL}/publishers/fetch/all`, properties);
		const result = await response.json();
		dispatch(success(PUBLISHERS_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchPublisherForStats = (id, token) => async dispatch => {
	dispatch(setListLoader());
	try {
		const response = await fetch(`${API_URL}/publishers/${id}`, {
			method: 'GET',
			headers: token ? {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			} :
				{'Content-Type': 'application/json'}
		});
		const result = await response.json();
		return result;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};
