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

import React, {useState, useEffect, useRef} from 'react';
import {
	Typography,
	Button,
	Grid,
	RootRef,
	Fab
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {validate} from '../../../utils';
import {FormattedMessage, useIntl} from 'react-intl';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import {commonStyles} from '../../../styles/app';
import * as actions from '../../../store/actions';
import PublicationRenderComponent from '../PublicationRenderComponent';
import SelectPublicationIdentifierRange from './SelectIssnIdentifierRange';
import PrintElement from '../../Print';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'issnUpdateForm',
	validate,
	enableReinitialize: true
})(props => {
	const {
		issn,
		userInfo,
		fetchIssn,
		fetchPublisher,
		handleSubmit,
		clearFields,
		updatePublicationIssn,
		match,
		history,
		loading,
		assignIssnRange,
		updatePublisher,
		fetchMarc,
		lang
	} = props;
	const {id} = match.params;
	const intl = useIntl();
	const componentRef = useRef();
	const classes = commonStyles();
	const {role} = userInfo;
	const [isEdit, setIsEdit] = useState(false);
	const [disableAssign, setDisableAssign] = useState(true);
	const [assignRange, setAssignRange] = useState(false);
	const [rangeBlockId, setRangeBlockId] = useState(null);
	const [next, setNext] = useState(false);
	const [rowSelectedId, setRowSelectedId] = useState(null);

	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);

	useEffect(() => {
		if (id !== null) {
			fetchIssn({id: id, token: cookie[COOKIE_NAME]});
		}
	}, [cookie, fetchIssn, id, loading]);

	useEffect(() => {
		if (issn.publisher !== undefined) {
			fetchPublisher(issn.publisher, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchPublisher, issn.publisher]);

	useEffect(() => {
		if (Object.keys(issn).length > 0) {
			if (issn.identifier && issn.identifier.length > 0) {
				if (issn.formatDetails.length === issn.identifier.length) {
					setDisableAssign(false);
				}

				setDisableAssign(true);
			} else {
				setDisableAssign(false);
			}
		}
	}, [issn]);

	useEffect(() => {
		run();
		async function run() {
			if (rangeBlockId !== null) {
				const resp = await assignIssnRange({rangeBlockId, issn}, cookie[COOKIE_NAME], lang);
				if (resp) {
					setAssignRange(false);
				}
			}
		}
	}, [assignIssnRange, cookie, rangeBlockId]);	// eslint-disable-line react-hooks/exhaustive-deps

	const handleEditClick = () => {
		setIsEdit(true);
	};

	const handleCancel = () => {
		setIsEdit(false);
	};

	const handlePublicationUpdate = values => {
		const {_id, firstYear, ...updateValues} = values;
		const token = cookie[COOKIE_NAME];
		const {alias, ...updatePublisherValues} = values.publisher;
		const publisherId = updatePublisherValues._id;
		delete updatePublisherValues._id;
		updatePublisher(publisherId, updatePublisherValues, token, lang);
		updatePublicationIssn(_id, {...updateValues, firstYear: Number(firstYear), publisher: issn.publisher}, token, lang);
		setIsEdit(false);
		history.push('/publications/issn');
	};

	function handleOnClickSendMessage() {
		const path = Buffer.from(`publication=${id}`).toString('base64');
		history.push({pathname: `/sendMessage/${path}`, state: {prevPath: `/publications/issn/${id}`, type: 'issn', id: id, publication: issn}});
	}

	function handleRange() {
		setAssignRange(!assignRange);
	}

	function handleOnClickShowMarc() {
		fetchMarc(issn.metadataReference.id, cookie[COOKIE_NAME]);
	}

	function handleOnClickSaveMarc() {
		console.log('save marc');
	}

	const handleTableRowClick = id => {
		setRowSelectedId(id);
	};

	function isEditable(key) {
		const nonEditableFields = userInfo.role === 'admin' ?
			['lastUpdated', '_id', 'associatedRange', 'identifier', 'metadataReference', 'request', 'associatedRange', 'type'] :
			(userInfo.role === 'publisher' ?
				['lastUpdated', '_id', 'associatedRange', 'identifier', 'metadataReference', 'request', 'associatedRange', 'type'] :
				[]);

		return isEdit && !nonEditableFields.includes(key);
	}

	const headRowsMetadataReference = [
		{id: 'format', label: <FormattedMessage id="publication.issn.metadataReference.headRows.format"/>},
		{id: 'state', label: <FormattedMessage id="publication.issn.metadataReference.headRows.state"/>},
		{id: 'status', label: <FormattedMessage id="publication.issn.metadataReference.headRows.status"/>},
		{id: 'identifier', label: <FormattedMessage id="publication.issn.metadataReference.headRows.identifier"/>}
	];

	const component = (
		<Grid item xs={12}>
			<Typography variant="h5" className={classes.titleTopSticky}>
				{issn.title ? issn.title : ''}&nbsp;ISSN&nbsp;
				<FormattedMessage id="listComponent.publicationDetails"/>
			</Typography>
			{
				(
					isEdit ?
						<div className={classes.listItem}>
							<form>
								<div className={classes.btnContainer}>
									<Button onClick={handleCancel}>
										<FormattedMessage id="form.button.label.cancel"/>
									</Button>
									<Button variant="contained" color="primary" onClick={handleSubmit(handlePublicationUpdate)}>
										<FormattedMessage id="form.button.label.update"/>
									</Button>
								</div>
								<Grid container spacing={3} className={classes.listItemSpinner}>
									<PublicationRenderComponent
										issn
										publication={issn}
										isEdit={isEdit}
										clearFields={clearFields}
										isEditable={isEditable}
										handleTableRowClick={handleTableRowClick}
										rowSelectedId={rowSelectedId}
										headRowsMetadataReference={headRowsMetadataReference}
									/>
								</Grid>
							</form>
						</div> :
						(
							assignRange ?
								<div className={classes.listItem}>
									{
										next ?
											<Button
												variant="outlined"
												endIcon={<ArrowForwardIosIcon/>}
												onClick={() => setNext(false)}
											>
												<FormattedMessage id="form.button.label.next"/>
											</Button> :
											<Button
												variant="outlined"
												startIcon={<ArrowBackIosIcon/>}
												onClick={handleRange}
											>
												<FormattedMessage id="form.button.label.back"/>
											</Button>

									}
									<SelectPublicationIdentifierRange
										issn={issn}
										handleRange={handleRange}
										setRangeBlockId={setRangeBlockId}
										{...props}
									/>
								</div> :
								<div className={classes.listItem}>
									{role !== undefined && role === 'admin' &&
										<div className={classes.btnContainer}>
											<Grid container item xs={12}>
												{
													<Grid item xs={2}>
														<Button disabled={disableAssign} className={classes.buttons} variant="outlined" color="primary" onClick={handleRange}>
															<FormattedMessage id="publicationRender.button.label.assignRanges"/>
														</Button>
													</Grid>
												}
												{
													issn.associatedRange && Object.keys(issn.associatedRange).length > 0 &&
														<Grid item xs={2}>
															<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickSendMessage}>
																<FormattedMessage id="button.label.sendMessage"/>
															</Button>
														</Grid>
												}
												{
													issn.metadataReference && issn.metadataReference.state === 'processed' &&
														<Grid item xs={2}>
															<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickShowMarc}>
																<FormattedMessage id="publicationRender.button.label.showMarc"/>
															</Button>
														</Grid>
												}
												{
													issn.metadataReference && issn.metadataReference.state === 'processed' &&
														<Grid item xs={2}>
															<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickSaveMarc}>
																<FormattedMessage id="publicationRender.button.label.saveMarc"/>
															</Button>
														</Grid>
												}
												{
													issn &&
														<Grid item xs={2}>
															<PrintElement componentRef={componentRef}/>
														</Grid>
												}
											</Grid>
											<Fab
												color="secondary"
												size="small"
												title={intl.formatMessage({id: 'publication.issn.edit.label'})}
												onClick={handleEditClick}
											>
												<EditIcon/>
											</Fab>
										</div>}
									<RootRef rootRef={componentRef}>
										<Grid container spacing={3} className={classes.listItemSpinner}>
											<PublicationRenderComponent
												issn
												publication={issn}
												isEdit={isEdit}
												clearFields={clearFields}
												isEditable={isEditable}
												handleTableRowClick={handleTableRowClick}
												rowSelectedId={rowSelectedId}
												headRowsMetadataReference={headRowsMetadataReference}
											/>
										</Grid>
									</RootRef>
								</div>
						)
				)
			}
		</Grid>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	return ({
		loading: state.common.loading,
		issn: state.publication.issn,
		initialValues: {...state.publication.issn, publisher: state.publisher.publisher},
		userInfo: state.login.userInfo,
		updatedIssn: state.publication.updatedIssn,
		messageListLoading: state.message.listLoading,
		messageInfo: state.message.messageInfo
	});
}
