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
import {Grid, Typography} from '@material-ui/core';

import useStyles from '../../styles/publisherLists';
import Message from './Message';
import useModalStyles from '../../styles/formList';
import ModalLayout from '../ModalLayout';
import TableComponent from '../TableComponent';
import * as actions from '../../store/actions';
import Spinner from '../Spinner';
import {useCookies} from 'react-cookie';
import TemplateCreationForm from '../form/TemplateCreationForm';

export default connect(mapStateToProps, actions)(props => {
	const classes = useStyles();
	const modalClasses = useModalStyles();
	const {loading, fetchMessagesList, messagesList, totalMessages, queryDocCount, offset} = props;
	const [cookie] = useCookies('login-cookie');
	const [page, setPage] = useState(1);
	const [cursors] = useState([]);
	const [lastCursor, setLastCursor] = useState(cursors.length === 0 ? null : cursors[cursors.length - 1]);
	const [modal, setModal] = useState(false);
	const [templateId, setTemplateId] = useState(null);
	useEffect(() => {
		fetchMessagesList(cookie['login-cookie'], lastCursor);
	}, [lastCursor, cursors, fetchMessagesList, cookie]);

	const handleTableRowClick = id => {
		setTemplateId(id);
		setModal(true);
	};

	const headRows = [
		{id: 'name', label: 'Name'},
		{id: 'subject', label: 'Subject'},
		{id: 'language', label: 'Language'}

	];

	let messageData;
	if (loading) {
		messageData = <Spinner/>;
	} else if (messagesList === undefined) {
		messageData = <p>No Users Available</p>;
	} else {
		messageData = (
			<TableComponent
				data={messagesList.map(item => usersDataRender(item))}
				handleTableRowClick={handleTableRowClick}
				headRows={headRows}
				offset={offset}
				cursors={cursors}
				page={page}
				setPage={setPage}
				setLastCursor={setLastCursor}
				totalDoc={totalMessages}
				queryDocCount={queryDocCount}
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
		<Grid>
			<Grid item xs={12} className={classes.publisherListSearch}>
				<Typography variant="h5">List of Avaiable messages</Typography>
				<ModalLayout form label="New Template" title="New Template" name="template" variant="outlined" classed={modalClasses.button} color="primary">
					<TemplateCreationForm {...props}/>
				</ModalLayout>
				{messageData}
				<Message id={templateId} modal={modal} setModal={setModal}/>
			</Grid>
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.contact.listLoading,
		messagesList: state.contact.messagesList,
		totalMessages: state.contact.totalMessages,
		offset: state.contact.offset,
		queryDocCount: state.contact.queryDocCount
	});
}
