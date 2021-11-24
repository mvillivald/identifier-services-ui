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
import {AUTHENTICATION, LOG_OUT} from './types';
import fetch from 'node-fetch';
import HttpStatus from 'http-status';
import {setMessage} from './commonAction';
import {createIntl, createIntlCache} from 'react-intl';
import {translations} from '../../intl/translations';

const cache = createIntlCache();

export const normalLogin = (values, lang) => async dispatch => {
	try {
		const messages = translations[lang];

		const intl = createIntl({
			locale: lang,
			defaultLocale: 'fi',
			messages: messages
		}, cache);
		const response = await fetch(`${API_URL}/auth`, {
			method: 'POST',
			body: JSON.stringify(values),
			headers: {
				Authorization: `Basic ${Buffer.from(`${values.username}:${values.password}`).toString('base64')}`,
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp', 'Content-Type': 'application/json'}
		});

		if (HttpStatus[`${response.status}_CLASS`] !== HttpStatus.classes.SUCCESSFUL) {
			throw new Error();
		}

		const body = await response.json();

		if (!Object.prototype.hasOwnProperty.call(body, 'accessToken')) {
			throw new Error();
		}

		dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'login.normal.success'})}));

		return dispatch(getUserInfo(body.accessToken));
	} catch (err) { // eslint-disable-line
		return 'unauthorize';
	}
};

export const getUserInfo = token => async dispatch => {
	/* global API_URL */
	/* eslint no-undef: "error" */
	try {
		const result = await fetch(`${API_URL}/auth`, {
			method: 'GET',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				Authorization: `Bearer ${token}`
			}
		});
		const user = await result.json();
		const updatedUser = {...user};
		delete updatedUser.groups;
		dispatch({
			type: AUTHENTICATION,
			payload:
			{user: updatedUser,
				authenticationToken: token}
		});
		return updatedUser;
	} catch (err) { // eslint-disable-line
		return 'unauthorize';
	}
};

export const logOut = () => async dispatch => {
	dispatch({
		type: LOG_OUT
	});
};
