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

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import {CookiesProvider} from 'react-cookie';

import App from './App';
import store from './store';

import {API_URL, COOKIE_NAME} from './configuration';
import {readCookie} from './utils';
import {getUserInfo} from './store/actions';

run();
async function run() {
	// Need refactor usage of globals, and setting authenticated user
	// Refactor considered successful after returns only render
	window.COOKIE_NAME = COOKIE_NAME;
	window.API_URL = API_URL;

	// For dev purposes only
	const cookie = readCookie(COOKIE_NAME);
	if (cookie) {
		store.dispatch(getUserInfo(cookie));
	}

	ReactDOM.render(
		<Provider store={store}>
			<CookiesProvider>
				<Router>
					<App/>
				</Router>
			</CookiesProvider>
		</Provider>, document.getElementById('app'));
}
