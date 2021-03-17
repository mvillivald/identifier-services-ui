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
import {
	Typography,
	Button,
	Grid,
	Fab
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {validate} from '@natlibfi/identifier-services-commons';
import {useIntl, FormattedMessage} from 'react-intl';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import {commonStyles} from '../../../styles/app';
import * as actions from '../../../store/actions';
import PublicationRenderComponent from '../PublicationRenderComponent';
import SelectPublicationIdentifierRange from './SelectIsbnIsmnIdentifierRange';
import {isbnClassificationCodes} from '../../form/publisherRegistrationForm/formFieldVariable';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'isbnIsmnUpdateForm',
	validate,
	enableReinitialize: true
})(props => {
	const {
		isbnIsmn,
		userInfo,
		fetchIsbnIsmn,
		handleSubmit,
		clearFields,
		updatePublicationIsbnIsmn,
		updatedIsbnIsmn,
		fetchPublisherOption,
		publisherOption,
		history,
		match,
		createIsbnBatch,
		createIsmnBatch,
		fetchMarc
	} = props;
	const {id} = match.params;
	const intl = useIntl();
	const classes = commonStyles();
	const {role} = userInfo;
	const [isEdit, setIsEdit] = useState(false);
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [assignRange, setAssignRange] = useState(false);
	const [subRangeId, setSubRangeId] = useState(null);
	const [publisherId, setPublisherId] = useState(null);
	const [disableAssign, setDisableAssign] = useState(true);
	const [next, setNext] = useState(false);

	useEffect(() => {
		if (id !== null) {
			fetchIsbnIsmn({id: id, token: cookie[COOKIE_NAME]});
			fetchPublisherOption({token: cookie[COOKIE_NAME]});
		}
	}, [cookie, fetchIsbnIsmn, fetchPublisherOption, id, updatedIsbnIsmn, isEdit]);

	useEffect(() => {
		if (Object.keys(isbnIsmn).length > 0) {
			if (isbnIsmn.identifier && isbnIsmn.identifier.length > 0) {
				setDisableAssign(true);
			} else {
				setDisableAssign(false);
			}
		}
	}, [isbnIsmn]);

	useEffect(() => {
		if (subRangeId !== null && publisherId !== null) {
			if (isbnIsmn.type === 'music') {
				createIsmnBatch({id: subRangeId, publisherId, isbnIsmn}, cookie[COOKIE_NAME]);
			} else {
				createIsbnBatch({id: subRangeId, publisherId, isbnIsmn}, cookie[COOKIE_NAME]);
			}

			setSubRangeId(null);
			setPublisherId(null);
		}
	}, [cookie, createIsbnBatch, createIsmnBatch, fetchIsbnIsmn, id, isbnIsmn, publisherId, subRangeId]);

	const handleEditClick = () => {
		setIsEdit(true);
	};

	const handleCancel = () => {
		setIsEdit(false);
	};

	const handlePublicationUpdate = values => {
		const {_id, authorFamilyName, authorGivenName, roles, ...rest} = values;
		const updateValues = {
			...rest,
			authors: formatAuthorsValue(isbnIsmn.authors, values.authors),
			isbnClassification: values.isbnClassification ? values.isbnClassification.map(item => item.value.toString()) : []
		};
		const token = cookie[COOKIE_NAME];
		updatePublicationIsbnIsmn(id, updateValues, token);
		setIsEdit(false);
	};

	function formatAuthorsValue(oldValue, newValue) {
		if (newValue !== undefined) {
			const value = newValue.map(item => ({
				givenName: item.authorGivenName ? item.authorGivenName : '',
				familyName: item.authorFamilyName ? item.authorFamilyName : '',
				role: item.role && item.role
			}));
			return value;
		}

		return oldValue;
	}

	function handleOnClickSendMessage() {
		const path = Buffer.from(`publication=${id}`).toString('base64');
		history.push({pathname: `/sendMessage/${path}`, state: {prevPath: `/publications/isbn-ismn/${id}`, type: 'isbn-ismn', id: id}});
	}

	function handleOnClickShowMarc() {
		fetchMarc(isbnIsmn.metadataReference.id, cookie[COOKIE_NAME]);
	}

	function handleOnClickPrint() {
		console.log('this is print');
	}

	function handleOnClickSaveMarc() {
		console.log('save marc');
	}

	function isEditable(key) {
		const nonEditableFields = userInfo.role === 'admin' ?
			['lastUpdated', '_id', 'associatedRange', 'identifier', 'metadataReference', 'request', 'associatedRange', 'type', 'format'] :
			(userInfo.role === 'publisher' ?
				['lastUpdated', '_id', 'associatedRange', 'identifier', 'metadataReference', 'request', 'associatedRange', 'type', 'format'] :
				[]);

		return isEdit && !nonEditableFields.includes(key);
	}

	function handleRange() {
		setAssignRange(!assignRange);
	}

	const component = (
		<Grid item xs={12}>
			<Typography variant="h5" className={classes.titleTopSticky}>
				{isbnIsmn.title ? isbnIsmn.title : ''}&nbsp;ISBN-ISMN&nbsp;
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
										isbnIsmn
										publication={isbnIsmn}
										isEdit={isEdit}
										clearFields={clearFields} isEditable={isEditable}
									/>
								</Grid>
							</form>
						</div> :
						(assignRange ?
							<div className={classes.listItem}>
								{
									publisherId ?
										<Button
											variant="outlined"
											endIcon={<ArrowForwardIosIcon/>}
											onClick={handleRange}
										>
											<FormattedMessage id="form.button.label.next"/>
										</Button> :
										(
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
										)
								}
								<SelectPublicationIdentifierRange
									isbnIsmn={isbnIsmn}
									rangeType="subRange"
									setSubRangeId={setSubRangeId}
									setPublisherId={setPublisherId}
									handleRange={handleRange}
									publisherOption={publisherOption}
									next={next}
									setNext={setNext}
									{...props}
								/>
							</div> :
							<div className={classes.listItem}>
								{role !== undefined && role === 'admin' &&
									<div className={classes.btnContainer}>
										<Grid container item xs={12}>
											{
												(subRangeId === null || subRangeId === undefined) &&
													<Grid item xs={2}>
														<Button disabled={disableAssign} className={classes.buttons} variant="outlined" color="primary" onClick={handleRange}>
															<FormattedMessage id="publicationRender.button.label.assignRanges"/>
														</Button>
													</Grid>
											}
											{
												isbnIsmn.associatedRange && Object.keys(isbnIsmn.associatedRange).length > 0 &&
													<Grid item xs={2}>
														<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickSendMessage}>
															<FormattedMessage id="button.label.sendMessage"/>
														</Button>
													</Grid>
											}
											{
												isbnIsmn.metadataReference && isbnIsmn.metadataReference.state === 'processed' &&
													<Grid item xs={2}>
														<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickShowMarc}>
															<FormattedMessage id="publicationRender.button.label.showMarc"/>
														</Button>
													</Grid>
											}
											{
												isbnIsmn.metadataReference && isbnIsmn.metadataReference.state === 'processed' &&
													<Grid item xs={2}>
														<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickSaveMarc}>
															<FormattedMessage id="publicationRender.button.label.saveMarc"/>
														</Button>
													</Grid>
											}
											{
												isbnIsmn &&
													<Grid item xs={2}>
														<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickPrint}>
															<FormattedMessage id="button.label.print"/>
														</Button>
													</Grid>
											}
										</Grid>
										<Fab
											color="primary"
											size="small"
											title={intl.formatMessage({id: 'publication.isbnismn.edit.label'})}
											onClick={handleEditClick}
										>
											<EditIcon/>
										</Fab>
									</div>}
								<Grid container spacing={3} className={classes.listItemSpinner}>
									<PublicationRenderComponent
										isbnIsmn
										publication={isbnIsmn}
										isEdit={isEdit} clearFields={clearFields}
										isEditable={isEditable}
									/>
								</Grid>
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
		isbnIsmn: state.publication.isbnIsmn,
		fetchedMarc: state.publication.fetchedMarc,
		initialValues: formatInitialValues(state.publication.isbnIsmn),
		publisherOption: state.publisher.publisherOptions,
		updatedIsbnIsmn: state.publication.updatedIsbnIsmn,
		userInfo: state.login.userInfo,
		messageListLoading: state.message.listLoading,
		messageInfo: state.message.messageInfo
	});

	function formatInitialValues(values) {
		if (Object.keys(values).length > 0) {
			const formattedValues = {
				...values,
				isbnClassification: values.isbnClassification && values.isbnClassification.map(item => {
					return formatClassificationForEditing(Number(item));
				}),
				authors: values.authors && values.authors.map(item => formatAuthorsForEditing(item))
			};
			return formattedValues;
		}

		function formatClassificationForEditing(v) {
			return isbnClassificationCodes.reduce((acc, k) => {
				if (k.value === v) {
					acc = k;
					return acc;
				}

				return acc;
			}, {});
		}

		function formatAuthorsForEditing(v) {
			return {
				authorGivenName: v.givenName,
				authorFamilyName: v.familyName,
				role: v.role
			};
		}
	}
}
