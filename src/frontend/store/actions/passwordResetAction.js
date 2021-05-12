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
import HttpStatus from 'http-status';
import {ERROR} from './types';
import {setMessage} from './commonAction';
import {createIntl, createIntlCache} from 'react-intl';
import enMessages from '../../intl/translations/en.json';
import fiMessages from '../../intl/translations/fi.json';
import svMessages from '../../intl/translations/sv.json';

const translations = {
	fi: fiMessages,
	en: enMessages,
	sv: svMessages
};

const cache = createIntlCache();

export const passwordReset = (values, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		const response = await fetch('/passwordreset', {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		if (response.status === HttpStatus.OK) {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Password Changed successfully'})}));
			return response.status;
		}
	} catch (err) {
		dispatch({
			type: ERROR,
			payload: err
		});
	}
};

export const passwordResetForm = (values, lang) => async dispatch => {
	const messsages = translations[lang];
	const intl = createIntl({
		locale: lang,
		defaultLocale: 'fi',
		messages: messsages
	}, cache);
	try {
		const response = await fetch('/passwordreset', {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		if (response.status === HttpStatus.OK) {
			dispatch(setMessage({color: 'success', msg: intl.formatMessage({id: 'Password reset link has been sent to your email'})}));
			return response.status;
		}

		if (response.status === HttpStatus.NOT_FOUND) {
			dispatch(setMessage({color: 'error', msg: intl.formatMessage({id: 'ID not found'})}));
		}
	} catch (err) {
		dispatch({
			type: ERROR,
			payload: err
		});
	}
};

export const decryptToken = values => async dispatch => {
	try {
		const response = await fetch('/decryptToken', {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		const result = await response.json();
		return result;
	} catch (err) {
		dispatch({
			type: ERROR,
			payload: err
		});
	}
};

export const decodeToken = values => async dispatch => {
	try {
		const response = await fetch('/decodeToken', {
			method: 'POST',
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(values)
		});
		const result = await response.json();
		return result;
	} catch (err) {
		dispatch({
			type: ERROR,
			payload: err
		});
	}
};
