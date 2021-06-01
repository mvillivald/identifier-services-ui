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
import {connect} from 'react-redux';
import {useCookies} from 'react-cookie';
import {Grid, Button, Typography} from '@material-ui/core';
import {useIntl, FormattedMessage} from 'react-intl';

import {commonStyles} from '../../styles/app';
import TableComponent from '../TableComponent';
import * as actions from '../../store/actions';
import Spinner from '../Spinner';

export default connect(mapStateToProps, actions)(props => {
	const classes = commonStyles();
	const intl = useIntl();
	const {loading, fetchTemplatesList, messagesList, totalMessages, history} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [page, setPage] = useState(0);
	const [rowSelectedId, setRowSelectedId] = useState(null);

	useEffect(() => {
		fetchTemplatesList(cookie[COOKIE_NAME]);
	}, [fetchTemplatesList, cookie]);

	const handleTableRowClick = id => {
		setRowSelectedId(id);
		history.push(`/template/${id}`);
	};

	function handleOnClick() {
		history.push('/templates/newTemplate');
	}

	const headRows = [
		{id: 'name', label: intl.formatMessage({id: 'messageTemplate.label.name'})},
		{id: 'subject', label: intl.formatMessage({id: 'messageTemplate.label.subject'})},
		{id: 'language', label: intl.formatMessage({id: 'messageTemplate.label.language'})}

	];

	let messageData;
	if (loading) {
		messageData = <Spinner/>;
	} else if (messagesList === undefined) {
		messageData = <p><FormattedMessage id="messageList.text.nodata"/></p>;
	} else {
		messageData = (
			<TableComponent
				pagination
				data={messagesList.map(item => usersDataRender(item))}
				handleTableRowClick={handleTableRowClick}
				rowSelectedId={rowSelectedId}
				headRows={headRows}
				page={page}
				setPage={setPage}
				totalDoc={totalMessages}
			/>
		);
	}

	function usersDataRender(item) {
		const {id, name, language, subject} = item;
		return {
			id: id,
			name: name,
			subject: subject,
			language: language
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5">
				<FormattedMessage id="messageTemplateList.list.heading"/>
			</Typography>
			<Button variant="outlined" color="primary" onClick={handleOnClick}>
				<FormattedMessage id="app.modal.title.newTemplate"/>
			</Button>
			{messageData}
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.message.listLoading,
		messagesList: state.message.messagesList,
		totalMessages: state.message.totalMessages
	});
}
