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
import CreatableSelect from 'react-select/creatable';
import {useQuill} from 'react-quilljs';
import {FormattedMessage} from 'react-intl';
import stringTemplate from 'string-template-js';
import 'quill/dist/quill.snow.css';

import RichTextEditor from './RichTextEditor';
import {modules, formats} from './style';
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
		publisherEmail,
		fetchIsbnIsmn,
		fetchPublisher,
		publisher,
		fetchIssn,
		isbnIsmn,
		issn,
		sendMessage,
		location,
		history,
		lang
	} = props;
	const {state} = location;
	const classes = useStyles();

	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [recipientEmail, setRecipientEmail] = useState(null);
	const [carbonCopy, setCarbonCopy] = useState(null);

	const [messageToBeSend, setMessageToBeSend] = useState(null);
	const {type, id, publication} = state;
	const publisherId = publication === undefined ? id : publication.publisher;

	const placeholder = 'Compose an epic...';

	const theme = 'snow';

	const {quill, quillRef} = useQuill({theme, modules, formats, placeholder});

	useEffect(() => {
		if (selectedTemplate !== null) {
			fetchMessageTemplate(selectedTemplate.value, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchMessageTemplate, selectedTemplate]);

	useEffect(() => {
		if (type === 'publisher') {
			fetchPublisherOption(cookie[COOKIE_NAME]);
		}

		if (type === 'isbn-ismn') {
			fetchPublisherOption(cookie[COOKIE_NAME]);
			fetchIsbnIsmn({id: id, token: cookie[COOKIE_NAME]});
		}

		if (type === 'issn') {
			fetchPublisherOption(cookie[COOKIE_NAME]);
			fetchIssn({id: id, token: cookie[COOKIE_NAME]});
		}
	}, [cookie, fetchIsbnIsmn, fetchIssn, fetchPublisherOption, id, type]);

	useEffect(() => {
		fetchAllTemplatesList(cookie[COOKIE_NAME]);
	}, [cookie, fetchAllTemplatesList]);

	useEffect(() => {
		if (publisherId !== undefined) {
			fetchPublisher(publisherId, cookie[COOKIE_NAME]);
		}
	}, [cookie, publisherId, fetchPublisher]);

	useEffect(() => {
		if (quill !== undefined && messageInfo !== null) {
			quill.clipboard.dangerouslyPasteHTML('');
			const body = Buffer.from(messageInfo.body, 'base64').toString('utf8');
			if (type === 'isbn-ismn') {
				const publicationType = isbnIsmn && isbnIsmn.type === 'music' ? 'ISMN' : 'ISBN';
				const identifierArgs = isbnIsmn && isbnIsmn.identifier && isbnIsmn.identifier.map(item =>
					(
						`<span>${publicationType} ${item.id}(${item.type})</span>`
					)
				);
				const newMessageBody = stringTemplate.replace(body, {identifier: identifierArgs});
				return quill.clipboard.dangerouslyPasteHTML(
					`<span>${newMessageBody}</span>`
				);
			}

			if (type === 'issn') {
				const publicationType = 'ISSN';
				const identifierArgs = issn && issn.identifier && issn.identifier.map(item =>
					(
						`<span>${publicationType} ${item.id}(${item.type})</span>`
					)
				);
				const newMessageBody = stringTemplate.replace(body, {identifier: identifierArgs});
				return quill.clipboard.dangerouslyPasteHTML(
					`<span>${newMessageBody}</span>`
				);
			}

			return quill.clipboard.dangerouslyPasteHTML(
				`<span>${body}</span>`
			);
		}
	}, [isbnIsmn, issn, messageInfo, type]); // eslint-disable-line react-hooks/exhaustive-deps

	function messageSelectOptions(templates) {
		if (templates !== undefined) {
			return templates.map(item => ({value: item.value, label: item.label}));
		}
	}

	function getPublisherOptions(option, email) {
		if (publisher) {
			return [{value: publisher.email, label: `${publisher.name} (${publisher.email})`}];
		}

		if (email) {
			return [{value: email, label: email}];
		}

		return option.map(item => ({value: item.email, label: item.label}));
	}

	function handleCancel() {
		if (quill !== undefined) {
			quill.clipboard.dangerouslyPasteHTML('');
		}

		history.push(state.prevPath);
	}

	function handleOnClickSend() {
		const div = document.createElement('div');
		div.innerHTML = messageToBeSend.body;
		const tooltipElement = div.getElementsByClassName('ql-tooltip ql-hidden')[0];
		div.removeChild(tooltipElement);
		if (recipientEmail !== null) {
			sendMessage({...messageToBeSend, body: div.innerHTML, sendTo: recipientEmail.map(i => i.value), cc: carbonCopy !== null && carbonCopy.map(i => i.value)}, cookie[COOKIE_NAME], lang);
			history.push(state.prevPath);
		}

		actions.setMessage({color: 'error', msg: 'recipient not defined'});
	}

	const component = (
		<Grid container item className={classes.listItem} xs={12}>
			<Grid item xs={12}>
				<CreatableSelect
					isMulti
					options={getPublisherOptions(publisherOption, publisherEmail)}
					placeholder="Select Recipient Publisher"
					value={recipientEmail}
					onChange={value => setRecipientEmail(value)}
				/>
			</Grid>
			<Grid item xs={12}>
				<CreatableSelect
					isMulti
					placeholder="Cc"
					value={carbonCopy}
					onChange={value => setCarbonCopy(value)}
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
					quill={quill}
					quillRef={quillRef}
					setMessageToBeSend={setMessageToBeSend}
				/>
			</Grid>
			<Grid item xs={12}>
				<Button variant="outlined" color="primary" onClick={handleCancel}>
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
		publisher: state.publisher.publisher,
		isbnIsmn: state.publication.isbnIsmn,
		issn: state.publication.issn,
		messageTemplates: state.message.messagesList,
		messageInfo: state.message.messageInfo
	});
}
