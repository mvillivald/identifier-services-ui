/* eslint-disable complexity */
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
import fetch from 'node-fetch';
import {ERROR, IDENTIFIER, IDR, IDR_LIST, IDR_ISMN_LIST, IDR_ISMN, IDR_ISSN_LIST, IDR_ISSN, RANGE_STATISTICS} from './types';
import {setLoader, setLoadingDone, setRangeListLoader, success, fail, setMessage} from './commonAction';
import HttpStatus from 'http-status';
import moment from 'moment';
import {createIntl, createIntlCache} from 'react-intl';
import enMessages from '../../intl/translations/en.json';
import fiMessages from '../../intl/translations/fi.json';
import svMessages from '../../intl/translations/sv.json';
import {ApiError} from '@natlibfi/identifier-services-commons/dist/error';

const translations = {
	fi: fiMessages,
	en: enMessages,
	sv: svMessages
};

const cache = createIntlCache();

export const fetchIDRList = ({token}) => async dispatch => {
	try {
		dispatch(setRangeListLoader());
		const query = {};
		const response = await fetch(`${API_URL}/ranges/query/identifier`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(IDR_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIsbnIDRList = ({searchText, token, activeCheck, rangeType}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = activeCheck !== undefined &&
		(activeCheck.canceled === true && activeCheck.active === true) ?
		(rangeType === 'subRange' ?
			{$or: [{isbnRangeId: searchText}, {publisherId: searchText}], canceled: {$ne: '0'}} :
			(rangeType === 'isbnBatch' ?
				{publisherIdentifierRangeId: searchText, identifierType: 'ISBN'} :
				(rangeType === 'identifier' ?
					{identifierBatchId: searchText} :
					{active: true, canceled: {$ne: '0'}}))) :
		activeCheck.checked === true ?
			(rangeType === 'subRange' ?
				{$or: [{isbnRangeId: searchText}, {publisherId: searchText}], active: true} :
				(rangeType === 'isbnBatch' ?
					{publisherIdentifierRangeId: searchText, identifierType: 'ISBN'} :
					(rangeType === 'identifier' ?
						{identifierBatchId: searchText} :
						{prefix: searchText, active: true}))) :
			activeCheck.canceled === true ?
				(rangeType === 'subRange' ?
					{$or: [{isbnRangeId: searchText}, {publisherId: searchText}], canceled: {$ne: '0'}} :
					(rangeType === 'isbnBatch' ?
						{publisherIdentifierRangeId: searchText, identifierType: 'ISBN'} :
						(rangeType === 'identifier' ?
							{identifierBatchId: searchText} :
							{canceled: {$ne: '0'}}))) :
				(
					rangeType === 'subRange' ?
						{$or: [{isbnRangeId: searchText}, {publisherId: searchText}]} :
						(rangeType === 'isbnBatch' ?
							{publisherIdentifierRangeId: searchText, identifierType: 'ISBN'} :
							(rangeType === 'identifier' ?
								{identifierBatchId: searchText} :
								{prefix: searchText}))
				);
	const fetchUrl = rangeType === 'range' ?
		`${API_URL}/ranges/query/isbn` :
		rangeType === 'subRange' ?
			`${API_URL}/ranges/query/isbn/subRange` :
			rangeType === 'isbnBatch' ?
				`${API_URL}/ranges/query/rangebatch` :
				`${API_URL}/ranges/query/identifier`;

	try {
		const response = await fetch(fetchUrl, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(IDR_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIDR = (id, token) => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/ranges/isbn/subRange/${id}`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});
		const result = await response.json();
		dispatch(success(IDR, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIdentifier = (id, token) => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/ranges/identifier/${id}`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});
		const result = await response.json();
		dispatch(success(IDENTIFIER, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createNewIsbnRange = (values, token) => async dispatch => {
	try {
		const response = await fetch(`${API_URL}/ranges/isbn/subRange`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		const result = await response.json();
		return result;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

// Not being Used but will be used in future
export const searchIDRList = ({searchField, searchText, token, rangeType}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = {[searchField]: searchText};
	const fetchUrl = rangeType === 'range' ?
		`${API_URL}/ranges/query/isbn` :
		rangeType === 'subRange' ?
			`${API_URL}/ranges/query/isbn/subRange` :
			rangeType === 'isbnBatch' ?
				`${API_URL}/ranges/query/rangebatch` :
				`${API_URL}/ranges/query/identifier`;

	try {
		const response = await fetch(fetchUrl, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(IDR_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createIsbnRange = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	const response = await fetch(`${API_URL}/ranges/isbn`, {
		method: 'POST',
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});
	if (response.status === HttpStatus.CREATED) {
		dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'ISBN range created successfully'})}));
		return response.status;
	}

	if (response.status === HttpStatus.CONFLICT) {
		dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'Range already exists'})}));
		return response.status;
	}

	dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'There is a problem creating ISBN range'})}));
	return response.status;
};

export const createIsbnBatch = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		const response = await fetch(`${API_URL}/ranges/isbnBatch`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});

		if (response) {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Range Successfully Assigned.'})}));
			return response;
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createUnboundIsbnList = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		const response = await fetch(`${API_URL}/ranges/isbn/createUnboundIsbnList`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});
		if (response.status === '200') {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'createUnboundIsbnList.success.created'})}));
			return response;
		}

		throw new ApiError(response.status);
	} catch (err) {
		dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'createUnboundIsbnList.error.creationFailed'})}));
		dispatch(fail(ERROR, err));
	}
};

// ***************ISMN****************************
export const fetchIsmnIDRList = ({searchText, token, activeCheck, rangeType}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = activeCheck !== undefined &&
		(activeCheck.canceled === true && activeCheck.active === true) ?
		(
			rangeType === 'subRange' ?
				{$or: [{ismnRangeId: searchText}, {publisherId: searchText}], active: true} :
				(rangeType === 'ismnBatch' ?
					{publisherIdentifierRangeId: searchText, identifierType: 'ISMN'} :
					(rangeType === 'identifier' ?
						{identifierBatchId: searchText} :
						{active: true, canceled: {$ne: '0'}}))
		) :
		activeCheck.checked === true ?
			(
				rangeType === 'subRange' ?
					{$or: [{ismnRangeId: searchText}, {publisherId: searchText}], active: true} :
					(rangeType === 'ismnBatch' ?
						{publisherIdentifierRangeId: searchText, identifierType: 'ISMN'} :
						(rangeType === 'identifier' ?
							{identifierBatchId: searchText} :
							{prefix: searchText, active: true}))
			) :
			activeCheck.canceled === true ?
				(
					rangeType === 'subRange' ?
						{$or: [{ismnRangeId: searchText}, {publisherId: searchText}], active: true} :
						(rangeType === 'ismnBatch' ?
							{publisherIdentifierRangeId: searchText, identifierType: 'ISMN'} :
							(rangeType === 'identifier' ?
								{identifierBatchId: searchText} :
								{canceled: {$ne: '0'}}))
				) :
				(
					rangeType === 'subRange' ?
						{$or: [{ismnRangeId: searchText}, {publisherId: searchText}]} :
						(rangeType === 'ismnBatch' ?
							{publisherIdentifierRangeId: searchText, identifierType: 'ISMN'} :
							(rangeType === 'identifier' ?
								{identifierBatchId: searchText} :
								{prefix: searchText}))
				);

	const fetchUrl = rangeType === 'range' ?
		`${API_URL}/ranges/query/ismn` :
		rangeType === 'subRange' ?
			`${API_URL}/ranges/query/ismn/subRange` :
			rangeType === 'ismnBatch' ?
				`${API_URL}/ranges/query/rangebatch` :
				`${API_URL}/ranges/query/identifier`;

	try {
		const response = await fetch(fetchUrl, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(IDR_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

// NOT BEING USED
export const fetchIDRIsmnList = ({searchText, token, activeCheck}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = (activeCheck !== undefined && activeCheck.checked === true) ? {prefix: searchText, active: true} :
		{prefix: searchText};

	try {
		const response = await fetch(`${API_URL}/ranges/ismn/query`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(IDR_ISMN_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIDRIsmn = (id, token) => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/ranges/ismn/subRange/${id}`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});
		const result = await response.json();
		dispatch(success(IDR, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createNewIsmnRange = (values, token) => async dispatch => {
	try {
		const response = await fetch(`${API_URL}/ranges/ismn/subRange`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		const result = await response.json();
		return result;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const updateIsmnRange = (id, values, token) => async dispatch => {
	dispatch(setRangeListLoader());

	try {
		const response = await fetch(`${API_URL}/ranges/ismn/${id}`, {
			method: 'PUT',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		const result = await response.json();
		dispatch(success(IDR_ISMN, result.value));
	} catch (err) {
		dispatch(setMessage({color: 'error', msg: err}));
		dispatch(fail(ERROR, err));
	}
};

export const createIsmnRange = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	dispatch(setRangeListLoader());
	const response = await fetch(`${API_URL}/ranges/ismn`, {
		method: 'POST',
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});
	if (response.status === HttpStatus.CREATED) {
		dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'ISMN range created successfully'})}));
		dispatch(success(IDR_ISMN, response));
		return response.status;
	}

	if (response.status === HttpStatus.CONFLICT) {
		dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'Range already exists'})}));
		dispatch(fail(ERROR, 'Range already exists'));
		return response.status;
	}

	dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'There is a problem creating ISMN range'})}));
	return response.status;
};

export const createIsmnBatch = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		const response = await fetch(`${API_URL}/ranges/ismnBatch`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});

		if (response) {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Range Successfully Assigned.'})}));
			return response;
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};
// ***************ISSN****************************

export const fetchIDRIssnList = ({searchText, token, activeCheck}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = activeCheck !== undefined &&
		(activeCheck.checked === true && activeCheck.canceled === true) ?
		{active: true, canceled: {$ne: '0'}} :
		activeCheck.checked === true ? {prefix: searchText, active: true} :
			activeCheck.canceled === true ? {canceled: {$ne: '0'}} :
				{prefix: searchText};

	try {
		const response = await fetch(`${API_URL}/ranges/issn/query`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}]
			})
		});
		const result = await response.json();
		dispatch(success(IDR_ISSN_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIDRIssn = (id, token) => async dispatch => {
	try {
		dispatch(setLoader());
		const response = await fetch(`${API_URL}/ranges/issn/${id}`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});
		const result = await response.json();
		dispatch(success(IDR_ISSN, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createIssnRange = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		const response = await fetch(`${API_URL}/ranges/issn`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});
		if (response.status === HttpStatus.CREATED) {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'ISSN range created successfully'})}));
			return response.status;
		}

		if (response.status === HttpStatus.CONFLICT) {
			dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'Range already exists'})}));
			return response.status;
		}

		dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'There is a problem creating ISSN range'})}));
		return response.status;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const assignIssnRange = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		dispatch(setLoader());
		const response = await fetch(`${API_URL}/ranges/issn/assignRange`, {
			method: 'POST',
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
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'ISSN range created successfully'})}));
			dispatch(setLoadingDone());
			return response.status;
		}

		dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'There is a problem creating ISSN range'})}));
		return response.status;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIssnRangeStatistics = ({startDate, endDate, token}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = {$and: [{'created.timestamp': {$gte: moment(startDate).toISOString()}}, {'created.timestamp': {$lte: moment(endDate).toISOString()}}]};

	try {
		const response = await fetch(`${API_URL}/ranges/issn/queryStatistics`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: query
			})
		});
		const result = await response.json();
		dispatch(success(RANGE_STATISTICS, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIsbnIsmnMonthlyStatistics = ({startDate, endDate, token}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = {$and: [{'created.timestamp': {$gte: moment(startDate).toISOString()}}, {'created.timestamp': {$lte: moment(endDate).toISOString()}}]};

	try {
		const response = await fetch(`${API_URL}/ranges/isbn-ismn/queryMonthlyStatistics`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				query: query
			})
		});
		const result = await response.json();
		dispatch(success(RANGE_STATISTICS, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIsbnIsmnStatistics = ({identifierType, token}) => async dispatch => {
	dispatch(setRangeListLoader());
	try {
		if (identifierType !== null) {
			const response = await fetch(`${API_URL}/ranges/isbn-ismn/queryIsbnIsmnStatistics`, {
				method: 'POST',
				headers: {
					'Cross-Origin-Opener-Policy': 'same-origin',
					'Cross-Origin-Embedder-Policy': 'require-corp',
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					query: identifierType
				})
			});
			const result = await response.json();
			dispatch(success(RANGE_STATISTICS, result));
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchAllSubRange = ({token}) => async dispatch => {
	dispatch(setRangeListLoader());
	try {
		const responseIsbn = await fetch(`${API_URL}/ranges/query/isbn/subRange`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {}
				}]
			})
		});
		const resultIsbn = await responseIsbn.json();
		const responseIsmn = await fetch(`${API_URL}/ranges/query/ismn/subRange`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {}
				}]
			})
		});
		const resultIsmn = await responseIsmn.json();
		dispatch(success(IDR_LIST, {results: [...resultIsbn.results, ...resultIsmn.results], totalDoc: resultIsbn.totalDoc + resultIsmn.totalDoc}));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const revokePublisherIsbn = ({subRangeValue, token}) => async dispatch => {
	try {
		dispatch(setLoader());
		const {item, type} = subRangeValue;
		const responseIsbn = await fetch(`${API_URL}/ranges/${type}/subRange/revoke`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {publisherIdentifier: item}
				}]
			})
		});
		return responseIsbn.json();
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const revokePublication = ({identifier, publisherId, token}) => async dispatch => {
	try {
		dispatch(setLoader());
		const response = await fetch(`${API_URL}/ranges/identifier/revoke`, {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {identifier: identifier}
				}],
				publisherId: publisherId
			})
		});
		return response.json();
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

