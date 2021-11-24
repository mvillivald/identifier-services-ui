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
	LOADER,
	LIST_LOADER,
	ERROR,
	ISBN_ISMN_LIST,
	FETCH_ISBN_ISMN,
	UPDATE_ISBN_ISMN,
	UPDATE_ISSN,
	ISSN_LIST,
	FETCH_ISSN,
	PUBLICATIONISBNISMN_REQUESTS_LIST,
	PUBLICATION_ISBN_ISMN_REQUEST,
	ISSN_REQUESTS_LIST,
	ISSN_REQUEST,
	ISSN_STATISTICS,
	FETCH_MARC
} from '../actions/types';

const initialState = {
	isbnIsmn: {},
	isbnIsmnList: [],
	updatedIsbnIsmn: {},
	updatedIssn: {},

	issn: {},
	issnList: [],

	publicationIsbnIsmnRequestList: [],
	publicationIsbnIsmnRequest: {},

	issnRequestsList: [],
	issnRequest: {},

	totalDoc: null,
	listLoading: false,
	loading: false,
	issnStatistics: null,
	fetchedMarc: null,
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
		case FETCH_ISBN_ISMN:
			return {
				...state,
				isbnIsmn: action.payload,
				loading: false
			};
		case UPDATE_ISBN_ISMN:
			return {
				...state,
				updatedIsbnIsmn: action.payload,
				loading: false
			};
		case UPDATE_ISSN:
			return {
				...state,
				updatedIssn: action.payload,
				loading: false
			};
		case FETCH_ISSN:
			return {
				...state,
				issn: action.payload,
				loading: false
			};
		case ISBN_ISMN_LIST:
			return {
				...state,
				isbnIsmnList: action.payload.results,
				totalDoc: action.payload.totalDoc,
				listLoading: false
			};
		case ISSN_LIST:
			return {
				...state,
				issnList: action.payload.results,
				totalDoc: action.payload.totalDoc,
				listLoading: false
			};
		case PUBLICATIONISBNISMN_REQUESTS_LIST:
			return {
				...state,
				publicationIsbnIsmnRequestList: action.payload.results,
				totalDoc: action.payload.totalDoc,
				listLoading: false
			};
		case PUBLICATION_ISBN_ISMN_REQUEST:
			return {
				...state,
				publicationIsbnIsmnRequest: action.payload,
				loading: false
			};
		case ISSN_REQUESTS_LIST:
			return {
				...state,
				issnRequestsList: action.payload.results,
				totalDoc: action.payload.totalDoc,
				listLoading: false
			};
		case ISSN_REQUEST:
			return {
				...state,
				issnRequest: action.payload,
				loading: false
			};
		case ISSN_STATISTICS:
			return {
				...state,
				issnStatistics: action.payload,
				listLoading: false
			};
		case FETCH_MARC:
			return {
				...state,
				fetchedMarc: action.payload,
				loading: false
			};
		case ERROR:
			return {
				...state,
				error: action.payload,
				loading: false
			};
		default:
			return state;
	}
}
