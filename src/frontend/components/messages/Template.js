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

import React, {useEffect} from 'react';
import {
	Grid,
	Button
} from '@material-ui/core';
import {useCookies} from 'react-cookie';
import {reduxForm, Field} from 'redux-form';
import {connect} from 'react-redux';
import {useQuill} from 'react-quilljs';
import {useIntl} from 'react-intl';

import {commonStyles} from '../../styles/app';
import useFormStyles from '../../styles/form';
import * as actions from '../../store/actions';
import renderTextField from '../form/render/renderTextField';
import {modules, formats} from '../messageElement/style';
import RichTextEditor from '../messageElement/RichTextEditor';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'messageTemplate',
	enableReinitialize: true
})(props => {
	const {fetchMessageTemplate, messageInfo, handleSubmit, updateMessageTemplate, match, history, lang} = props;
	const classes = commonStyles();
	const formClasses = useFormStyles();
	const intl = useIntl();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const {id} = match.params;

	const placeholder = 'Compose an epic...';
	const theme = 'snow';
	const {quill, quillRef} = useQuill({theme, modules, formats, placeholder});

	useEffect(() => {
		const token = cookie[COOKIE_NAME];
		if (id !== null) {
			fetchMessageTemplate(id, token);
		}
	}, [cookie, fetchMessageTemplate, id]);

	useEffect(() => {
		if (quill !== undefined && (messageInfo !== null && messageInfo !== undefined)) {
			quill.clipboard.dangerouslyPasteHTML(
				`<span>${Buffer.from(messageInfo.body, 'base64').toString('utf8')}</span>`
			);
		}
	}, [messageInfo]); // eslint-disable-line react-hooks/exhaustive-deps

	function handleMessageUpdate(values) {
		const {_id, ...updateValue} = {
			...values,
			body: Buffer.from(values.body.body).toString('base64')
		};
		updateMessageTemplate(id, updateValue, cookie[COOKIE_NAME], lang);
		history.push('/templates');
	}

	let messageDetail = (
		<Grid container item xs={12} md={12}>
			<Grid item xs={12} md={12} style={{margin: '10px 0'}}>
				<Field
					name="subject"
					className={formClasses.editForm}
					component={renderTextField}
					props={{variant: 'outlined', label: intl.formatMessage({id: 'messageTemplate.label.subject'})}}
				/>
			</Grid>
			<Grid item xs={12} md={12}>
				<Field
					className={formClasses.textArea}
					component={RichTextEditor}
					name="body"
					props={{quillRef, quill}}
				/>
				{/* <div style={{width: '100%', minHeight: 400, border: '1px solid lightgray'}}>
					<div ref={quillRef}/>
				</div> */}
			</Grid>
		</Grid>
	);

	const component = (
		<div style={{width: '100%', margin: '60px'}}>
			<form>
				<div className={classes.btnContainer}>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSubmit(handleMessageUpdate)}
					>
						UPDATE
					</Button>
				</div>
				{messageDetail}
			</form>
		</div>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	return ({
		loading: state.message.loading,
		messageInfo: state.message.messageInfo,
		initialValues: {...state.message.messageInfo, body: state.message.messageInfo && Buffer.from(state.message.messageInfo.body, 'base64').toString('utf8')}
	});
}
