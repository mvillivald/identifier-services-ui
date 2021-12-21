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

import {fail, success, setLoader} from './commonAction';
import {ERROR, GET_CAPTCHA} from './types';

export const loadSvgCaptcha = () => async dispatch => {
	dispatch(setLoader());
	try {
		const response = await fetch(`${API_URL}/captcha`, {
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
		const response = await fetch(`${API_URL}/captcha`, {
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
