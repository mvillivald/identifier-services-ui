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
	List,
	ListItem,
	ListItemText
} from '@material-ui/core';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {useQuill} from 'react-quilljs';
import 'quill/dist/quill.snow.css';

import {commonStyles} from '../../styles/app';
import * as actions from '../../store/actions';
import Spinner from '../Spinner';

export default connect(mapStateToProps, actions)(props => {
	const {match, fetchMessage, messageInfo} = props;
	const {id} = match.params;
	const classes = commonStyles();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);

	const theme = 'snow';

	const {quill, quillRef} = useQuill({theme});

	useEffect(() => {
		if (quill !== undefined && messageInfo !== null) {
			quill.clipboard.dangerouslyPasteHTML(
				`<span>${Buffer.from(messageInfo.body, 'base64').toString('utf8')}}</span>`
			);
			quill.enable(false);
		}
	}, [messageInfo]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const token = cookie[COOKIE_NAME];
		if (id !== null) {
			fetchMessage(id, token);
		}
	}, [cookie, fetchMessage, id]);

	let messageDetail;
	if (messageInfo === null) {
		messageDetail = <Spinner/>;
	} else {
		messageDetail = (
			<Grid item xs={12} md={12}>
				<List>
					<ListItem>
						<ListItemText>
							<Grid container>
								<Grid item xs={1}>
									<strong>
										<FormattedMessage id="message.label.email"/>:
									</strong>
								</Grid>
								<Grid item xs={11}>{messageInfo.email}</Grid>
							</Grid>
							<Grid container>
								<Grid item xs={1}>
									<strong>
										<FormattedMessage id="message.label.subject"/>:
									</strong>
								</Grid>
								<Grid item xs={11}>{messageInfo.subject}</Grid>
							</Grid>
							<Grid container>
								<div style={{width: '100%', minHeight: 400, border: '1px solid lightgray'}}>
									<div ref={quillRef}/>
								</div>
								{/* <Grid item xs={8}>{Buffer.from(messageInfo.body, 'base64').toString('utf8')}</Grid> */}
							</Grid>
						</ListItemText>
					</ListItem>
				</List>
			</Grid>
		);
	}

	const component = (
		<div style={{width: '100%', margin: '60px'}}>
			<Grid container spacing={3} className={classes.listItemSpinner}>
				{messageDetail}
			</Grid>
		</div>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.message.loading,
		messageInfo: state.message.messageInfo,
		initialValues: {...state.message.messageInfo, body: state.message.messageInfo && Buffer.from(state.message.messageInfo.body, 'base64').toString('utf8')}
	});
}
