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

import React, {useState, useEffect} from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {Switch, Route, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Grid} from '@material-ui/core';
import {IntlProvider} from 'react-intl';
import {MuiThemeProvider} from '@material-ui/core/styles';
import {useCookies} from 'react-cookie';

import Home from './components/main';
import IsbnIsmnRegistrationForm from './components/form/IsbnIsmnRegForm';
import IssnRegistrationForm from './components/form/IssnRegForm';
import PublisherRegistrationForm from './components/form/publisherRegistrationForm/PublisherRegistrationForm';
import TopNav from './components/navbar/topNav';
import AdminNav from './components/navbar/adminNav';
import NewUserPasswordResetForm from './components/form/NewUserPasswordResetForm';
import Publisher from './components/publishers/Publisher';
import PublishersList from './components/publishers/PublishersList';
import PublisherProfile from './components/publishers/PublisherProfile';
import Proceedings from './components/publishers/Proceedings';
import User from './components/users/User';
import UsersList from './components/users/UsersList';
import IsbnIsmnList from './components/publication/isbnIsmn/IsbnIsmnList';
import IsbnIsmn from './components/publication/isbnIsmn/IsbnIsmn';
import IssnList from './components/publication/issn/IssnList';
import Issn from './components/publication/issn/Issn';
import UsersRequestsList from './components/usersRequests/UsersRequestsList';
import UsersRequest from './components/usersRequests/UsersRequest';
import TemplatesList from './components/messages/TemplatesList';
import MessagesList from './components/messages/MessagesList';
import Message from './components/messages/Message';
import PublishersRequestsList from './components/publishersRequests/PublishersRequestsList';
import PublishersRequest from './components/publishersRequests/publisherRequest';
import PublicationIsbnIsmnRequest from './components/publicationRequests/isbnIsmRequest/IsbnIsmnRequest';
import PublicationIsbnIsmnRequestList from './components/publicationRequests/isbnIsmRequest/IsbnIsmnRequestList';
import IssnRequestList from './components/publicationRequests/issnRequest/IssnRequestList';
import IssnRequest from './components/publicationRequests/issnRequest/IssnRequest';
import IDRISNBList from './components/identifierRanges/isbn/RangesList';
import IDRISMNList from './components/identifierRanges/ismn/RangesList';
import IDRIssnList from './components/identifierRanges/issn/IssnList';
import Statistics from './components/statistics';
import MessageElement from './components/messageElement/MessageElement';
import Footer from './components/footer';
import PrivateRoute from './components/PrivateRoutes';
import theme from './styles/app';
import enMessages from './intl/translations/en.json';
import fiMessages from './intl/translations/fi.json';
import svMessages from './intl/translations/sv.json';
import SnackBar from './components/SnackBar';
import {commonStyles} from './styles/app';
import * as actions from './store/actions';
import Template from './components/messages/Template';

export default connect(mapStateToProps, actions)(withRouter(props => {
	const {lang, userInfo, isAuthenticated, history, responseMessage} = props;
	const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const token = cookie[COOKIE_NAME];
	const classes = commonStyles();
	useEffect(() => {
		setIsAuthenticatedState(isAuthenticated);
	}, [isAuthenticated, token]);

	const routeField = [
		{path: '/', component: Home},
		{path: '/publishers', component: PublishersList},
		{path: '/publishers/:id', component: Publisher},
		{path: '/publishers/proceedings/:id', component: Proceedings},
		{path: '/users/passwordReset/:token', component: NewUserPasswordResetForm},
		{path: '/publishers/profile/:id', component: PublisherProfile}
	];

	const routeForms = [
		{path: '/isbnIsmnRegistrationForm', component: IsbnIsmnRegistrationForm},
		{path: '/issnRegistrationForm', component: IssnRegistrationForm},
		{path: '/publisherRegistrationForm', component: PublisherRegistrationForm}
	];

	const privateRoutesList = [
		{path: '/users', role: ['admin', 'publisher', 'system'], component: UsersList},
		{path: '/users/:id', role: ['admin', 'publisher', 'system'], component: User},
		{path: '/publications/isbn-ismn', role: ['admin', 'publisher', 'system'], component: IsbnIsmnList},
		{path: '/publications/isbn-ismn/:id', role: ['admin', 'publisher', 'system'], component: IsbnIsmn},
		{path: '/publications/issn', role: ['admin', 'publisher', 'system'], component: IssnList},
		{path: '/publications/issn/:id', role: ['admin', 'publisher', 'system'], component: Issn},
		{path: '/requests/users', role: ['admin', 'publisher'], component: UsersRequestsList},
		{path: '/requests/users/:id', role: ['admin', 'publisher'], component: UsersRequest},
		{path: '/templates', role: ['admin'], component: TemplatesList},
		{path: '/template/:id', role: ['admin'], component: Template},
		{path: '/messages', role: ['admin'], component: MessagesList},
		{path: '/messages/:id', role: ['admin'], component: Message},
		{path: '/requests/publishers', role: ['publisher', 'admin'], component: PublishersRequestsList},
		{path: '/requests/publishers/:id', role: ['system', 'admin'], component: PublishersRequest},
		{path: '/requests/publications/isbn-ismn', role: ['publisher', 'admin'], component: PublicationIsbnIsmnRequestList},
		{path: '/requests/publications/isbn-ismn/:id', role: ['publisher', 'admin'], component: PublicationIsbnIsmnRequest},
		{path: '/requests/publications/issn', role: ['publisher', 'admin'], component: IssnRequestList},
		{path: '/requests/publications/issn/:id', role: ['publisher', 'admin'], component: IssnRequest},
		{path: '/ranges/isbn', role: ['admin'], component: IDRISNBList},
		{path: '/ranges/ismn', role: ['admin'], component: IDRISMNList},
		// {path: '/ranges/ismn/:id', role: ['admin'], component: IDRIsbnList},
		{path: '/ranges/issn', role: ['admin'], component: IDRIssnList},
		{path: '/ranges/issn/:id', role: ['admin'], component: IDRIssnList},
		{path: '/statistics', role: ['admin'], component: Statistics},
		{path: '/sendMessage/:id', role: ['admin'], component: MessageElement}
	];

	const routes = (
		<>
			{routeField.map(fields => (
				<Route
					key={fields.path}
					exact
					path={fields.path}
					render={props => <fields.component {...props}/>}
				/>
			))}
			{
				routeForms.map(fields => (
					<Route
						key={fields.path}
						exact
						path={fields.path}
						render={props => <fields.component {...props}/>}
					/>
				))
			}
			{privateRoutesList.map(pRoute => (
				<PrivateRoute
					key={pRoute.path}
					exact
					role={pRoute.role}
					path={pRoute.path}
					component={pRoute.component}
				/>
			))}
		</>
	);

	const translations = {
		fi: fiMessages,
		en: enMessages,
		sv: svMessages

	};

	const component = (
		<IntlProvider locale={lang} messages={translations[lang]}>
			<MuiThemeProvider theme={theme}>
				<Grid container>
					<Grid container item xs={12}>
						<TopNav userInfo={userInfo} isAuthenticated={isAuthenticatedState} history={history}/>
					</Grid>
					<Grid container item xs={12}>
						<CssBaseline/>
					</Grid>
					<Grid container item xs={12}>
						<AdminNav userInfo={userInfo} isAuthenticated={isAuthenticatedState}/>
					</Grid>
					<Grid container item xs={12} className={classes.bodyContainer}>
						<Switch>
							{routes}
						</Switch>
						{responseMessage && <SnackBar variant={responseMessage.color} openSnackBar={Boolean(responseMessage)} {...props}/>}
					</Grid>
					<Footer/>
				</Grid>
			</MuiThemeProvider>
		</IntlProvider>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	return {
		lang: state.locale.lang,
		responseMessage: state.message.responseMessage,
		isAuthenticated: state.login.isAuthenticated,
		userInfo: state.login.userInfo
	};
}
