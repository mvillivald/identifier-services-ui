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
import {
	USERS_LIST,
	ERROR,
	FETCH_USER,
	UPDATE_USER
} from './types';

import {setLoader,
	setListLoader, success, setMessage, fail} from './commonAction';
import HttpStatus from 'http-status';

const translations = {
	fi: fiMessages,
	en: enMessages,
	sv: svMessages
};

const cache = createIntlCache();

export const fetchUsersList = (token, sort) => async dispatch => {
	dispatch(setListLoader());
	try {
		const response = await fetch(`${API_URL}/users/query`, {
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
				}],
				sort: sort
			})
		});
		const result = await response.json();
		dispatch(success(USERS_LIST, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const createUser = (values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	const response = await fetch(`${API_URL}/users`, {
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
	if (response.status === HttpStatus.OK || response.status === HttpStatus.CREATED) {
		const response = await fetch('/sendEmail', {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({request: values})
		});
		if (response.status === HttpStatus.OK) {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'User created successfully'})}));
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Message sent successfully.'})}));
			return response;
		}

		return response.status;
	}

	if (response.status === HttpStatus.NOT_FOUND) {
		dispatch(setMessage({color: 'error', msg: 'SSO-ID doesnot exists in crowd'}));
		return response.status;
	}

	if (response.status === HttpStatus.CONFLICT || response.status === HttpStatus.INTERNAL_SERVER_ERROR) {
		dispatch(setMessage({color: 'error', msg: 'User with this SSO-ID or email already exists'}));
		return response.status;
	}
};

export const fetchUser = (id, token) => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/users/${id}`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`
			}
		});
		const result = await response.json();
		dispatch(success(FETCH_USER, result));
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const findUserByUserId = ({userId, token}) => async dispatch => {
	dispatch(setLoader());
	try {
		const properties = {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`
			}
		};
		const crowdResult = await fetch(`${API_URL}/users/${userId}`, properties);
		const result = await crowdResult.json();
		if (crowdResult.status === HttpStatus.NOT_FOUND) {
			dispatch(fail(ERROR, 'Invalid SSO-Id'));
			return crowdResult.status;
		}

		return result;
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

export const updateUser = (id, values, token, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/users/${id}`, {
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
			dispatch(success(UPDATE_USER, result));
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'User Updated Succesfully.'})}));
		}
	} catch (err) {
		dispatch(fail(ERROR, err));
	}
};

// Export const deleteUser = (id, values, token) => async dispatch => {
// 	dispatch(setLoader());
// 	try {
// 		const response = await fetch(`${API_URL}/users/${id}`, {
// 			method: 'DELETE',
// 			headers: {
// 				Authorization: `Bearer ${token}`,
// 				'Content-Type': 'application/json'
// 			},
// 			credentials: 'same-origin',
// 			body: JSON.stringify(values)
// 		});

// 		if (response.status === HttpStatus.OK) {
// 			dispatch(setMessage({color: 'success', msg: 'User Successfully Deleted!!!'}));
// 			return response.status;
// 		}
// 	} catch (err) {
// 		dispatch(fail(ERROR, err));
// 	}
// };

// async function createLinkAndSendEmail({request, PRIVATE_KEY_URL}) {
// 	const {JWK, JWE} = jose;
// 	const key = JWK.asKey(fs.readFileSync(PRIVATE_KEY_URL));
// 	if (CROWD_URL && CROWD_APP_NAME && CROWD_APP_PASSWORD) {
// 		const crowdClient = new CrowdClient({
// 			baseUrl: CROWD_URL,
// 			application: {
// 				name: CROWD_APP_NAME,
// 				password: CROWD_APP_PASSWORD
// 			}
// 		});

// 		const response = await crowdClient.user.get(request.id);
// 		if (response) {
// 			const payload = jose.JWT.sign(request, key, {
// 				expiresIn: '24 hours',
// 				iat: true
// 			});
// 			const token = await JWE.encrypt(payload, key, {kid: key.kid});
// 			const link = `${UI_URL}/users/passwordReset/${token}`;
// 			const result = sendEmail({
// 				name: 'forgot password',
// 				args: {link},
// 				getTemplate,

// 				SMTP_URL,
// 				API_EMAIL: request.email
// 			});
// 			return result;
// 		}
// 	}
// }

// async function getTemplate(query, cache) {
// 	const client = createApiClient({
// 		url: API_URL,
// 		username: API_USERNAME,
// 		password: API_PASSWORD,
// 		userAgent: API_CLIENT_USER_AGENT
// 	});
// 	const key = JSON.stringify(query);
// 	if (key in cache) {
// 		return cache[key];
// 	}

// 	return {...cache, [key]: await client.templates.getTemplate(query)};
// }
