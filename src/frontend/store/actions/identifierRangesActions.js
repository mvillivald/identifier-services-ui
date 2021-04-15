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
import {setLoader, setRangeListLoader, success, fail, setMessage} from './commonAction';
import HttpStatus from 'http-status';
import moment from 'moment';

export const fetchIsbnIDRList = ({searchText, token, offset, activeCheck, rangeType}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = (activeCheck !== undefined && activeCheck.checked === true) ?
		(
			rangeType === 'subRange' ?
				{$or: [{isbnRangeId: searchText}, {publisherId: searchText}], active: true} :
				(rangeType === 'isbnBatch' ?
					{publisherIdentifierRangeId: searchText, identifierType: 'ISBN'} :
					(rangeType === 'identifier' ?
						{identifierBatchId: searchText} :
						{prefix: searchText, active: true}))
		) :
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
				`${API_URL}/ranges/query/isbnBatch` :
				`${API_URL}/ranges/query/identifier`;

	try {
		const response = await fetch(fetchUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}],
				offset: offset
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
export const searchIDRList = ({searchField, searchText, token, offset, rangeType}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = {[searchField]: searchText};
	const fetchUrl = rangeType === 'range' ?
		`${API_URL}/ranges/query/isbn` :
		rangeType === 'subRange' ?
			`${API_URL}/ranges/query/isbn/subRange` :
			rangeType === 'isbnBatch' ?
				`${API_URL}/ranges/query/isbnBatch` :
				`${API_URL}/ranges/query/identifier`;

	try {
		const response = await fetch(fetchUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}],
				offset: offset
			})
		});
		const result = await response.json();
		dispatch(success(IDR_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createIsbnRange = (values, token) => async dispatch => {
	const response = await fetch(`${API_URL}/ranges/isbn`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});
	if (response.status === HttpStatus.CREATED) {
		dispatch(setMessage({color: 'success', msg: 'ISBN range created successfully'}));
		return response.status;
	}

	if (response.status === HttpStatus.CONFLICT) {
		dispatch(setMessage({color: 'error', msg: 'Range already exists'}));
		return response.status;
	}

	dispatch(setMessage({color: 'error', msg: 'There is a problem creating ISBN range'}));
	return response.status;
};

export const createIsbnBatch = (values, token) => async dispatch => {
	try {
		const response = await fetch(`${API_URL}/ranges/isbnBatch`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});

		if (response) {
			dispatch(setMessage({color: 'success', msg: 'Range Successfully Assigned.'}));
			return response;
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

// ***************ISMN****************************
export const fetchIsmnIDRList = ({searchText, token, offset, activeCheck, rangeType}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = (activeCheck !== undefined && activeCheck.checked === true) ?
		(
			rangeType === 'subRange' ?
				{$or: [{ismnRangeId: searchText}, {publisherId: searchText}], active: true} :
				(rangeType === 'ismnBatch' ?
					{publisherIdentifierRangeId: searchText, identifierType: 'ISMN'} :
					(rangeType === 'identifier' ?
						{identifierBatchId: searchText} :
						{prefix: searchText, active: true}))
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
				`${API_URL}/ranges/query/ismnBatch` :
				`${API_URL}/ranges/query/identifier`;

	try {
		const response = await fetch(fetchUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}],
				offset: offset
			})
		});
		const result = await response.json();
		dispatch(success(IDR_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIDRIsmnList = ({searchText, token, offset, activeCheck}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = (activeCheck !== undefined && activeCheck.checked === true) ? {prefix: searchText, active: true} :
		{prefix: searchText};

	try {
		const response = await fetch(`${API_URL}/ranges/ismn/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}],
				offset: offset
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

export const createIsmnRange = (values, token) => async dispatch => {
	dispatch(setRangeListLoader());
	const response = await fetch(`${API_URL}/ranges/ismn`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});
	if (response.status === HttpStatus.CREATED) {
		dispatch(setMessage({color: 'success', msg: 'ISMN range created successfully'}));
		dispatch(success(IDR_ISMN, response));
		return response.status;
	}

	if (response.status === HttpStatus.CONFLICT) {
		dispatch(setMessage({color: 'error', msg: 'Range already exists'}));
		dispatch(fail(ERROR, 'Range already exists'));
		return response.status;
	}

	dispatch(setMessage({color: 'error', msg: 'There is a problem creating ISMN range'}));
	return response.status;
};

export const createIsmnBatch = (values, token) => async dispatch => {
	try {
		const response = await fetch(`${API_URL}/ranges/ismnBatch`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			credentials: 'same-origin',
			body: JSON.stringify(values)
		});

		if (response) {
			dispatch(setMessage({color: 'success', msg: 'Range Successfully Assigned.'}));
			return response;
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};
// ***************ISSN****************************

export const fetchIDRIssnList = ({searchText, token, offset, activeCheck}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = (activeCheck !== undefined && activeCheck.checked === true) ? {prefix: searchText, active: true} :
		{prefix: searchText};

	try {
		const response = await fetch(`${API_URL}/ranges/issn/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: query
				}],
				offset: offset
			})
		});
		const result = await response.json();
		dispatch(success(IDR_ISSN_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const fetchIDRIssn = (id, token) => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/ranges/issn/${id}`, {
			method: 'GET',
			headers: {
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

export const createIssnRange = (values, token) => async dispatch => {
	const response = await fetch(`${API_URL}/ranges/issn`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});
	if (response.status === HttpStatus.CREATED) {
		dispatch(setMessage({color: 'success', msg: 'ISSN range created successfully'}));
		return response.status;
	}

	if (response.status === HttpStatus.CONFLICT) {
		dispatch(setMessage({color: 'error', msg: 'Range already exists'}));
		return response.status;
	}

	dispatch(setMessage({color: 'error', msg: 'There is a problem creating ISSN range'}));
	return response.status;
};

export const assignIssnRange = (values, token) => async dispatch => {
	const response = await fetch(`${API_URL}/ranges/issn/assignRange`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(values)
	});
	if (response.status === HttpStatus.OK) {
		dispatch(setMessage({color: 'success', msg: 'ISSN range created successfully'}));
		return response.status;
	}

	dispatch(setMessage({color: 'error', msg: 'There is a problem creating ISSN range'}));
	return response.status;
};

export const fetchIssnRangeStatistics = ({startDate, endDate, token}) => async dispatch => {
	dispatch(setRangeListLoader());
	const query = {$and: [{'created.timestamp': {$gte: moment(startDate).toISOString()}}, {'created.timestamp': {$lte: moment(endDate).toISOString()}}]};

	try {
		const response = await fetch(`${API_URL}/ranges/issn/queryStatistics`, {
			method: 'POST',
			headers: {
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

export const fetchAllSubRange = ({token, offset}) => async dispatch => {
	dispatch(setRangeListLoader());
	try {
		const responseIsbn = await fetch(`${API_URL}/ranges/query/isbn/subRange`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {}
				}],
				offset: offset
			})
		});
		const resultIsbn = await responseIsbn.json();
		const responseIsmn = await fetch(`${API_URL}/ranges/query/ismn/subRange`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {}
				}],
				offset: offset
			})
		});
		const resultIsmn = await responseIsmn.json();
		dispatch(success(IDR_LIST, {results: [...resultIsbn, ...resultIsmn]}));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const revokePublisherIsbn = ({subRangeValue, token}) => async dispatch => {
	dispatch(setLoader());
	try {
		const responseIsbn = await fetch(`${API_URL}/ranges/isbn/subRange/revoke`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				queries: [{
					query: {publisherIdentifier: subRangeValue}
				}]
			})
		});
		return responseIsbn.json();
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};
