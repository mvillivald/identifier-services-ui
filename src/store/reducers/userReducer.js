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

import {USERS_LIST, LOADER, LIST_LOADER, ERROR, FETCH_USER, UPDATE_USER} from '../actions/types';

const initialState = {
	usersList: [],
	totalUsers: null,

	usersRequest: {},
	usersRequestsList: [],
	totalUsersRequests: null,

	user: {},
	loading: false,
	listLoading: false,
	userUpdated: {},
	userRequestUpdated: {},
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
		case FETCH_USER:
			return {
				...state,
				user: action.payload,
				loading: false
			};
		case UPDATE_USER:
			return {
				...state,
				userUpdated: action.payload,
				loading: false
			};
		case USERS_LIST:
			return {
				...state,
				usersList: action.payload.results,
				totalUsers: action.payload.totalDoc,
				listLoading: false
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
