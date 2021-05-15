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
import {Grid, Typography, Button} from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import {useIntl, FormattedMessage} from 'react-intl';

import {commonStyles} from '../../styles/app';
import SearchComponent from '../SearchComponent';
import TableComponent from '../TableComponent';
import * as actions from '../../store/actions';
import Spinner from '../Spinner';

export default connect(mapStateToProps, actions)(props => {
	const classes = commonStyles();
	const intl = useIntl();
	const {loading, fetchMessagesList, messagesList, totalMessages, location, history} = props;
	const {email, prevPath} = location.state;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [page, setPage] = useState(0);
	const [rowSelectedId, setRowSelectedId] = useState(null);
	const [inputVal, setSearchInputVal] = useState('');

	useEffect(() => {
		fetchMessagesList({searchText: inputVal, token: cookie[COOKIE_NAME], sort: {'lastUpdated.timestamp': -1}, email: email});
	}, [fetchMessagesList, cookie, email, inputVal]);

	function handleTableRowClick(id) {
		setRowSelectedId(id);
		history.push(`/messages/${id}`);
	}

	function handleBack() {
		history.push(prevPath);
	}

	const headRows = [
		{id: 'empty', label: ''},
		{id: 'email', label: intl.formatMessage({id: 'message.label.email'})},
		{id: 'subject', label: intl.formatMessage({id: 'message.label.subject'})},
		{id: 'body', label: intl.formatMessage({id: 'message.label.body'})}
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
		const {id, email, subject, body} = item;
		return {
			id: id,
			empty: '',
			email: email,
			subject: subject,
			body: `${Buffer.from(body, 'base64').toString('utf8').slice(0, 20)}... `
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5">
				<FormattedMessage id="messageList.list.heading"/>
			</Typography>
			<Grid item xs={12}>
				<SearchComponent searchFunction={fetchMessagesList} setSearchInputVal={setSearchInputVal}/>
			</Grid>
			<Grid container item xs={12}>
				<Button
					variant="outlined"
					startIcon={<ArrowBackIosIcon/>}
					onClick={handleBack}
				>
					<FormattedMessage id="form.button.label.back"/>
				</Button>
			</Grid>
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
