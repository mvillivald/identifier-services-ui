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

import {LOADER, LOADER_DONE, LIST_LOADER, SET_FORM_NAME, SNACKBAR_MESSAGE, RANGE_LIST_LOADER, SEARCH_LIST_LOADER, PUBLICATION_LOADER} from './types';

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
