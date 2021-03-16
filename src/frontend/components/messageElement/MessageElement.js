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
import {Grid, Button} from '@material-ui/core';
import {connect} from 'react-redux';
import {useCookies} from 'react-cookie';
import Select from 'react-select';
import {FormattedMessage} from 'react-intl';

import RichTextEditor from './RichTextEditor';
import * as actions from '../../store/actions';
import useStyles from '../../styles/messageElement';

export default connect(mapStateToProps, actions)(props => {
	const {
		messageTemplates,
		messageInfo,
		fetchAllTemplatesList,
		fetchMessageTemplate,
		fetchPublisherOption,
		publisherOption,
		messageToBeSend,
		setMessageToBeSend,
		handleOnClickSend,
		handleCancelSendMessage,
		publisherEmail,
		publication,
		setPublisherEmail
	} = props;
	const classes = useStyles();

	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [selectedPublisher, setSelectedPublisher] = useState(null);

	useEffect(() => {
		setMessageToBeSend(null);
		if (selectedTemplate !== null) {
			fetchMessageTemplate(selectedTemplate.value, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchMessageTemplate, selectedTemplate, setMessageToBeSend]);

	useEffect(() => {
		fetchPublisherOption(cookie[COOKIE_NAME]);
	}, [cookie, fetchPublisherOption]);

	useEffect(() => {
		fetchAllTemplatesList(cookie[COOKIE_NAME]);
	}, [cookie, fetchAllTemplatesList]);

	useEffect(() => {
		if (selectedPublisher) {
			setPublisherEmail(selectedPublisher.value);
		}
	}, [selectedPublisher, setPublisherEmail]);

	function messageSelectOptions(templates) {
		if (templates !== undefined) {
			return templates.map(item => ({value: item.value, label: item.label}));
		}
	}

	function getPublisherOptions(option, email) {
		if (email) {
			return [{value: email, label: email}];
		}

		return option.map(item => ({value: item.email, label: item.label}));
	}

	const component = (
		<Grid className={classes.listItem}>
			<Grid item xs={12}>
				<Select
					isMulti={false}
					options={getPublisherOptions(publisherOption, publisherEmail)}
					placeholder="Select Recipient Publisher"
					value={selectedPublisher}
					onChange={value => setSelectedPublisher(value)}
				/>
			</Grid>
			<Grid item xs={12}>
				{/* Selectable list of Message Templates */}
				<Select
					isMulti={false}
					options={messageSelectOptions(messageTemplates)}
					placeholder="Select message template from the list"
					value={selectedTemplate}
					onChange={value => setSelectedTemplate(value)}
				/>
				{/* Format and Edit Message */}
				<RichTextEditor
					messageInfo={messageInfo}
					args={{
						identifier: publication && publication.identifier && publication.identifier,
						type: publication && publication.type === 'music' ? 'ISMN' : 'ISBN'
					}}
					setMessageToBeSend={setMessageToBeSend}
				/>
			</Grid>
			<Grid item xs={12}>
				<Button variant="outlined" color="primary" onClick={handleCancelSendMessage}>
					<FormattedMessage id="button.label.cancel"/>
				</Button>
				<Button disabled={messageToBeSend === null || publisherEmail === null} variant="outlined" color="primary" onClick={handleOnClickSend}>
					<FormattedMessage id="button.label.sendMessage"/>
				</Button>
			</Grid>
		</Grid>
	);

	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		publisherOption: state.publisher.publisherOptions,
		messageTemplates: state.message.messagesList,
		messageInfo: state.message.messageInfo
	});
}
