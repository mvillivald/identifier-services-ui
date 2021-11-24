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

import {
	PUBLISHERS_LIST,
	PUBLISHER, LOADER,
	LIST_LOADER,
	ERROR,
	SEARCH_PUBLISHER,
	PUBLISHERS_REQUESTS_LIST,
	PUBLISHER_REQUEST,
	UNIVERSITY_PUBLISHER,
	PUBLISHER_OPTIONS,
	SEARCH_LIST_LOADER,
	UPDATE_PUBLISHER
} from '../actions/types';

const initialState = {
	publishersList: [],
	publisher: {},
	publisherUpdated: {},
	publisherOptions: [],
	searchedPublisher: null,

	publishersRequestsList: [],
	publisherRequest: {},

	universityPublisher: [],

	totalDoc: null,

	loading: false,
	listLoading: false,
	searchListLoading: false,
	error: {}
};

export default function (state = initialState, action) {
	switch (action.type) {
		case LOADER:
			return {
				...state,
				loading: true
			};
		case LIST_LOADER:
			return {
				...state,
				listLoading: true
			};
		case SEARCH_LIST_LOADER:
			return {
				...state,
				searchListLoading: true
			};
		case PUBLISHERS_LIST:
			return {
				...state,
				publishersList: action.payload,
				listLoading: false
			};
		case PUBLISHER:
			return {
				...state,
				publisher: action.payload,
				loading: false
			};
		case UPDATE_PUBLISHER:
			return {
				...state,
				publisherUpdated: action.payload,
				loading: false
			};
		case PUBLISHERS_REQUESTS_LIST:
			return {
				...state,
				publishersRequestsList: action.payload.results,
				totalDoc: action.payload.totalDoc,
				listLoading: false
			};
		case PUBLISHER_REQUEST:
			return {
				...state,
				publisherRequest: action.payload,
				loading: false
			};
		case UNIVERSITY_PUBLISHER:
			return {
				...state,
				universityPublisher: action.payload,
				loading: false,
				listLoading: false
			};
		case ERROR:
			return {
				...state,
				error: action.payload,
				loading: false
			};
		case SEARCH_PUBLISHER:
			return {
				...state,
				searchedPublisher: action.payload.results,
				totalDoc: action.payload.totalDoc,
				searchListLoading: false
			};
		case PUBLISHER_OPTIONS:
			return {
				...state,
				publisherOptions: action.payload,
				listLoading: false
			};

		default:
			return state;
	}
}
