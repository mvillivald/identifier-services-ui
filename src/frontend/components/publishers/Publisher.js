/* eslint-disable complexity */
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
	Button,
	Grid,
	Typography,
	RootRef,
	Fab
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {FormattedMessage, useIntl} from 'react-intl';

import {commonStyles} from '../../styles/app';
import * as actions from '../../store/actions';
import {connect} from 'react-redux';
import {validate} from '@natlibfi/identifier-services-commons';
import Spinner from '../Spinner';
import ListComponent from '../ListComponent';
import SelectRange from './SelectRange';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import {classificationCodes} from '../form/publisherRegistrationForm/formFieldVariable';
import PrintElement from '../Print';
import TableComponent from '../TableComponent';
import AlertDialogs from '../AlertDialogs';

const mapDispatchToProps = {
	...actions,
	postMessage: actions.setMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxForm({
	form: 'publisherUpdateForm',
	validate,
	enableReinitialize: true
})(props => {
	const {
		fetchPublisher,
		fetchIDR,
		fetchIDRIsmn,
		fetchAllSubRange,
		updatePublisher,
		match,
		history,
		publisher,
		publisherUpdated,
		loading,
		range,
		createNewIsbnRange,
		createNewIsmnRange,
		handleSubmit,
		sendMessage,
		postMessage,
		clearFields,
		fetchIsbnIDRList,
		subRangeList,
		rangeListLoading,
		isAuthenticated,
		revokePublisherIsbn,
		userInfo,
		lang
	} = props;
	const {id} = match.params;
	const classes = commonStyles();
	const intl = useIntl();
	const [isEdit, setIsEdit] = useState(false);
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [assignRange, setAssignRange] = useState(false);
	const [newPublisherRangeId, setNewPublisherRangeId] = useState(null);
	const [enableUpdate, setEnableUpdate] = useState(false);
	const [disableAssign, setDisableAssign] = useState(false);
	const [tabsValue, setTabsValue] = useState('isbn');
	const [message, setMessage] = useState(null);
	const [openAlert, setOpenAlert] = useState(false);
	const [confirmation, setConfirmation] = useState(false);
	const [selectedToRevoke, setSelectedToRevoke] = useState(null);
	const [isRevoking, setIsRevoking] = useState(false);
	const [page, setPage] = React.useState(0);

	const activeCheck = {
		checked: true
	};

	const componentRef = useRef();

	useEffect(() => {
		if (id !== null) {
			fetchPublisher(id, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchPublisher, id, publisherUpdated, isEdit, sendMessage, isRevoking, updatePublisher]);

	useEffect(() => {
		fetchAllSubRange({token: cookie[COOKIE_NAME]});
	}, [cookie, fetchAllSubRange, updatePublisher, isEdit, publisherUpdated]);

	useEffect(() => {
		async function run() {
			if (newPublisherRangeId !== null) {
				if (tabsValue === 'isbn') {
					// TO DO Check for active only
					const newRange = await createNewIsbnRange({id, rangeId: newPublisherRangeId}, cookie[COOKIE_NAME]);
					if (newRange) {
						fetchIDR(newRange, cookie[COOKIE_NAME]);
						setEnableUpdate(true);
					}
				}

				if (tabsValue === 'ismn') {
					const newRange = await createNewIsmnRange({id, rangeId: newPublisherRangeId}, cookie[COOKIE_NAME]);
					if (newRange) {
						fetchIDRIsmn(newRange, cookie[COOKIE_NAME]);
						setEnableUpdate(true);
					}
				}
			}
		}

		run();
	}, [cookie, createNewIsbnRange, createNewIsmnRange, fetchIDR, fetchIDRIsmn, id, newPublisherRangeId, tabsValue]);

	useEffect(() => {
		if (Object.keys(publisher).length > 0) {
			if (publisher.identifier && publisher.identifier.length > 0) {
				setDisableAssign(true);
			} else {
				setDisableAssign(false);
			}
		}
	}, [publisher]);

	useEffect(() => {
		if (confirmation && selectedToRevoke !== null) {
			setIsRevoking(true);
			const filteredSubrange = subRangeList.filter(item => selectedToRevoke.includes(item.publisherIdentifier) && item);
			const deletableRange = filteredSubrange.filter(i => Number(i.taken) === 0);
			if (deletableRange.length > 0) {
				selectedToRevoke.forEach(async item => {
					const filtered = deletableRange.filter(obj => item === obj.publisherIdentifier);
					if (filtered.length > 0) {
						const type = filtered[0].isbnRangeId ? 'isbn' : filtered[0].ismnRangeId ? 'ismn' : '';
						const result = await revokePublisherIsbn({subRangeValue: {item, type}, token: cookie[COOKIE_NAME]});
						if (result) {
							setIsRevoking(false);
						}
					}
				});
			} else {
				postMessage({color: 'error', msg: intl.formatMessage({id: 'publisher.revoke.impossible'})});
			}
		}
	}, [confirmation, cookie, revokePublisherIsbn, selectedToRevoke]); // eslint-disable-line react-hooks/exhaustive-deps

	function handleOnAgree() {
		setConfirmation(true);
	}

	function handleOnCancel() {
		setConfirmation(false);
	}

	const handleEditClick = () => {
		setIsEdit(true);
	};

	const handleCancel = () => {
		setIsEdit(false);
	};

	function handleBack() {
		setAssignRange(false);
		history.push(`/publishers/${id}`);
	}

	function handleRange() {
		setAssignRange(!assignRange);
		fetchIsbnIDRList({token: cookie[COOKIE_NAME], activeCheck: activeCheck, rangeType: 'range'});
	}

	function handleOnClickSendMessage() {
		const path = Buffer.from(`publisher=${id}`).toString('base64');
		history.push({pathname: `/sendMessage/${path}`, state: {prevPath: `/publishers/${id}`, id: id, type: 'publisher'}});
	}

	function isEditable(key) {
		const nonEditableFields = ['lastUpdated', '_id', 'isbnRange', 'ismnRange', 'request'];
		const publisherEditableFields = ['phone', 'language', 'contactPerson'];

		const result = isEdit && userInfo.role === 'admin' ?
			!nonEditableFields.includes(key) :
			(userInfo.role === 'publisher' ?
				publisherEditableFields.includes(key) :
				false);
		return result;
	}

	function handleRequestIsbn() {
		history.push({pathname: '/isbnIsmnRegistrationForm', state: {prevPath: `/publishers/${id}`}});
	}

	const headRowsPublisherIdentifier = [
		{id: 'checkbox', label: ''},
		{id: 'publisherIdentifier', label: <FormattedMessage id="publisher.identifier.headRows.identifier"/>},
		{id: 'free', label: <FormattedMessage id="publisher.identifier.headRows.free"/>},
		{id: 'next', label: <FormattedMessage id="publisher.identifier.headRows.next"/>},
		{id: 'type', label: <FormattedMessage id="publisher.identifier.headRows.type"/>},
		{id: 'active', label: <FormattedMessage id="publisher.identifier.headRows.active"/>}
	];

	const headRowsSelfPublisherIdentifier = [
		{id: 'empty', label: ''},
		{id: 'identifier', label: <FormattedMessage id="publisher.identifier.headRows.identifier"/>},
		{id: 'publicationType', label: <FormattedMessage id="publisher.identifier.headRows.publicationType"/>}
	];

	function handleDelete(value) {
		setMessage(intl.formatMessage({id: 'publisher.identifier.confirmation.message.revoke'}));
		setSelectedToRevoke(value);
	}

	const {_id, publisherRangeId, ...formattedPublisherDetail} = {...publisher, ...publisher.organizationDetails, notes: (publisher && publisher.notes) ? publisher.notes.map(item => {
		return {note: Buffer.from(item).toString('base64')};
	}) : ''};
	let publisherDetail;
	if ((Object.keys(publisher).length === 0) || formattedPublisherDetail === undefined || loading || rangeListLoading) {
		publisherDetail = <Spinner/>;
	} else {
		publisherDetail = (userInfo.role === 'admin') ?
			(
				<>
					<Grid container item xs={6} md={6} spacing={2}>
						<Grid item xs={12}>
							<Grid item xs={12}>
								<Typography variant="h6">
									<FormattedMessage id="listComponent.basicInformations"/>
								</Typography>
								<hr/>
								<ListComponent
									edit={isEdit && isEditable('name')}
									fieldName="name"
									label={intl.formatMessage({id: 'listComponent.name'})}
									value={formattedPublisherDetail.name ? formattedPublisherDetail.name : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('code')}
									fieldName="code"
									label={intl.formatMessage({id: 'listComponent.code'})}
									value={formattedPublisherDetail.code ? formattedPublisherDetail.code : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('phone')}
									fieldName="phone"
									label={intl.formatMessage({id: 'listComponent.phone'})}
									value={formattedPublisherDetail.phone ? formattedPublisherDetail.phone : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('language')}
									fieldName="language"
									label={intl.formatMessage({id: 'listComponent.language'})}
									value={formattedPublisherDetail.language ? formattedPublisherDetail.language : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('email')}
									fieldName="email"
									label={intl.formatMessage({id: 'listComponent.email'})}
									value={formattedPublisherDetail.email ? formattedPublisherDetail.email : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('contactPerson')}
									fieldName="contactPerson"
									label={intl.formatMessage({id: 'listComponent.contactPerson'})}
									value={formattedPublisherDetail.contactPerson ? formattedPublisherDetail.contactPerson : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('publisherCategory')}
									fieldName="publisherCategory"
									label={intl.formatMessage({id: 'listComponent.publisherCategory'})}
									value={formattedPublisherDetail.publisherCategory ? formattedPublisherDetail.publisherCategory : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('publisherType')}
									fieldName="publisherType"
									label={intl.formatMessage({id: 'listComponent.publisherType'})}
									value={formattedPublisherDetail.publisherType ? formattedPublisherDetail.publisherType : ''}
								/>
								<ListComponent
									fieldName="creator"
									label={intl.formatMessage({id: 'listComponent.creator'})}
									value={formattedPublisherDetail.creator ? formattedPublisherDetail.creator : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('website')}
									fieldName="website"
									label={intl.formatMessage({id: 'listComponent.website'})}
									value={formattedPublisherDetail.website ? formattedPublisherDetail.website : ''}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="h6">
									<FormattedMessage id="listComponent.postalAddress"/>
								</Typography>
								<hr/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[address]')}
									fieldName="postalAddress[address]"
									label={intl.formatMessage({id: 'listComponent.address'})}
									value={formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.address ?
										formattedPublisherDetail.postalAddress.address : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[city]')}
									fieldName="postalAddress[city]"
									label={intl.formatMessage({id: 'listComponent.city'})}
									value={formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.city ?
										formattedPublisherDetail.postalAddress.city : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[zip]')}
									fieldName="postalAddress[zip]"
									label={intl.formatMessage({id: 'listComponent.zip'})}
									value={formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.zip ?
										formattedPublisherDetail.postalAddress.zip : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[public]')}
									fieldName="postalAddress[public]"
									label={intl.formatMessage({id: 'listComponent.public'})}
									value={Boolean(formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.public)}
								/>
							</Grid>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.organizationDetails"/>
							</Typography>
							<hr/>
							<ListComponent
								edit={isEdit && isEditable('organizationDetails[affiliate]')}
								fieldName="organizationDetails[affiliate]"
								label={intl.formatMessage({id: 'listComponent.affiliate'})}
								value={formattedPublisherDetail && formattedPublisherDetail.organizationDetails && formattedPublisherDetail.organizationDetails.affiliate ?
									formattedPublisherDetail.organizationDetails.affiliate : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('organizationDetails[distributor]')}
								fieldName="organizationDetails[distributor]"
								label={intl.formatMessage({id: 'listComponent.distributor'})}
								value={formattedPublisherDetail && formattedPublisherDetail.organizationDetails && formattedPublisherDetail.organizationDetails.distributor ?
									formattedPublisherDetail.organizationDetails.distributor : ''}
							/>
						</Grid>
					</Grid>
					<Grid container item xs={6} md={6} spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.aliases"/>
							</Typography>
							<hr/>
							<ListComponent
								edit={isEdit && isEditable('aliases')}
								fieldName="aliases"
								clearFields={clearFields}
								label={intl.formatMessage({id: 'listComponent.aliases'})}
								value={formattedPublisherDetail.aliases ? formattedPublisherDetail.aliases : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.earlierName"/>
							</Typography>
							<hr/>
							<ListComponent
								edit={isEdit && isEditable('earlierName')}
								fieldName="earlierName"
								clearFields={clearFields}
								label={intl.formatMessage({id: 'listComponent.earlierName'})}
								value={formattedPublisherDetail.earlierName ? formattedPublisherDetail.earlierName : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								Frequency
							</Typography>
							<hr/>
							<ListComponent
								edit={isEdit && isEditable('publicationDetails[frequency][currentYear]')}
								fieldName="publicationDetails[frequency][currentYear]"
								label={intl.formatMessage({id: 'listComponent.currentYear'})}
								value={formattedPublisherDetail && formattedPublisherDetail.publicationDetails && formattedPublisherDetail.publicationDetails.frequency && formattedPublisherDetail.publicationDetails.frequency.currentYear ?
									formattedPublisherDetail.publicationDetails.frequency.currentYear : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publicationDetails[frequency][nextYear]')}
								fieldName="publicationDetails[frequency][nextYear]"
								label={intl.formatMessage({id: 'listComponent.nextYear'})}
								value={formattedPublisherDetail && formattedPublisherDetail.publicationDetails && formattedPublisherDetail.publicationDetails.frequency && formattedPublisherDetail.publicationDetails.frequency.nextYear ?
									formattedPublisherDetail.publicationDetails.frequency.nextYear : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.classification"/>
							</Typography>
							<hr/>
							<Grid container style={{display: 'flex', flexDirection: 'column'}}>
								<ListComponent
									edit={isEdit && isEditable('classification')} fieldName="classification"
									clearFields={clearFields}
									label={intl.formatMessage({id: 'listComponent.classification'})}
									value={formattedPublisherDetail.classification ? formattedPublisherDetail.classification : []}
								/>
							</Grid>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.publisherIdentifier"/>
							</Typography>
							<hr/>
							{
								formattedPublisherDetail.publisherIdentifier && subRangeList !== undefined && subRangeList.length > 0 ?
									<TableComponent
										rowDeletable
										data={formattedPublisherDetail.publisherIdentifier.map(item => tablePublisherData(item))}
										headRows={headRowsPublisherIdentifier}
										handleDelete={handleDelete}
									/> :
									<Typography variant="body1">
										{intl.formatMessage({id: 'publicationRender.label.identifierNotAssigned'})}
									</Typography>
							}
						</Grid>
						{userInfo.role === 'admin' &&
							<>
								<Grid item xs={12}>
									<Typography variant="h6">
										<FormattedMessage id="listComponent.otherReference"/>
									</Typography>
									<hr/>
									<ListComponent
										fieldName="publisherRangeId"
										label={intl.formatMessage({id: 'listComponent.publisherRangeId'})}
										value={formattedPublisherDetail.publisherRangeId ? formattedPublisherDetail.publisherRangeId : ''}
									/>
									{userInfo.role === 'admin' && <ListComponent
										linkPath={`/requests/publishers/${formattedPublisherDetail.request}`}
										fieldName="request"
										label={intl.formatMessage({id: 'listComponent.request'})}
										value={formattedPublisherDetail.request ? formattedPublisherDetail.request : ''}
									/>}
									<ListComponent
										edit={isEdit && isEditable('metadataDelivery')}
										fieldName="metadataDelivery"
										label={intl.formatMessage({id: 'listComponent.metadataDelivery'})}
										value={formattedPublisherDetail.metadataDelivery ? formattedPublisherDetail.metadataDelivery : ''}
									/>
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6">
										<FormattedMessage id="listComponent.activity"/>
									</Typography>
									<hr/>
									<ListComponent
										edit={isEdit && isEditable('activity[active]')}
										fieldName="activity[active]"
										label={intl.formatMessage({id: 'listComponent.active'})}
										value={Boolean(formattedPublisherDetail.activity && formattedPublisherDetail.activity.active)}
									/>
									<ListComponent
										edit={isEdit && isEditable('activity[yearInactivated]')}
										fieldName="activity[yearInactivated]"
										label={intl.formatMessage({id: 'listComponent.yearInactivated'})}
										value={formattedPublisherDetail.activity && formattedPublisherDetail.activity.yearInactivated ? formattedPublisherDetail.activity.yearInactivated : ''}
									/>
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6">
										<FormattedMessage id="listComponent.lastUpdated"/>
									</Typography>
									<hr/>
									<ListComponent
										fieldName="timestamp"
										label={intl.formatMessage({id: 'listComponent.timestamp'})}
										value={formattedPublisherDetail.lastUpdated ?
											(formattedPublisherDetail.lastUpdated.timestamp ?
												formattedPublisherDetail.lastUpdated.timestamp :
												''
											) : ''}
									/>
									<ListComponent
										label={intl.formatMessage({id: 'listComponent.user'})}
										value={formattedPublisherDetail.lastUpdated ?
											(formattedPublisherDetail.lastUpdated.user ?
												formattedPublisherDetail.lastUpdated.user :
												''
											) : ''}
									/>
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6">
										<FormattedMessage id="listComponent.additionalDetails"/>
									</Typography>
									<hr/>
									<ListComponent
										edit={isEdit && isEditable('additionalDetails')}
										fieldName="additionalDetails"
										label={intl.formatMessage({id: 'listComponent.additionalDetails'})}
										value={formattedPublisherDetail.additionalDetails ? formattedPublisherDetail.additionalDetails : ''}
									/>
								</Grid>
							</>}
					</Grid>
				</>

			) : (
				<>
					<Grid container item xs={6} md={6} spacing={2}>
						<Grid item xs={12}>
							<Grid item xs={12}>
								<Typography variant="h6">
									<FormattedMessage id="listComponent.basicInformations"/>
								</Typography>
								<hr/>
								<ListComponent
									edit={isEdit && isEditable('name')}
									fieldName="name"
									label={intl.formatMessage({id: 'listComponent.name'})}
									value={formattedPublisherDetail.name ? formattedPublisherDetail.name : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('code')}
									fieldName="code"
									label={intl.formatMessage({id: 'listComponent.code'})}
									value={formattedPublisherDetail.code ? formattedPublisherDetail.code : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('phone')}
									fieldName="phone"
									label={intl.formatMessage({id: 'listComponent.phone'})}
									value={formattedPublisherDetail.phone ? formattedPublisherDetail.phone : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('email')}
									fieldName="email"
									label={intl.formatMessage({id: 'listComponent.email'})}
									value={formattedPublisherDetail.email ? formattedPublisherDetail.email : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('website')}
									fieldName="website"
									label={intl.formatMessage({id: 'listComponent.website'})}
									value={formattedPublisherDetail.website ? formattedPublisherDetail.website : ''}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="h6">
									<FormattedMessage id="listComponent.postalAddress"/>
								</Typography>
								<hr/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[address]')}
									fieldName="postalAddress[address]"
									label={intl.formatMessage({id: 'listComponent.address'})}
									value={formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.address ?
										formattedPublisherDetail.postalAddress.address : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[city]')}
									fieldName="postalAddress[city]"
									label={intl.formatMessage({id: 'listComponent.city'})}
									value={formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.city ?
										formattedPublisherDetail.postalAddress.city : ''}
								/>
								<ListComponent
									edit={isEdit && isEditable('postalAddress[zip]')}
									fieldName="postalAddress[zip]"
									label={intl.formatMessage({id: 'listComponent.zip'})}
									value={formattedPublisherDetail && formattedPublisherDetail.postalAddress && formattedPublisherDetail.postalAddress.zip ?
										formattedPublisherDetail.postalAddress.zip : ''}
								/>
							</Grid>
						</Grid>
					</Grid>
					<Grid container item xs={6} md={6} spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.aliases"/>
							</Typography>
							<hr/>
							<ListComponent
								edit={isEdit && isEditable('aliases')}
								fieldName="aliases"
								clearFields={clearFields}
								label={intl.formatMessage({id: 'listComponent.aliases'})}
								value={formattedPublisherDetail.aliases ? formattedPublisherDetail.aliases : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.publisherIdentifier"/>
							</Typography>
							<hr/>
							{formattedPublisherDetail.selfPublisherIdentifier &&
								<TableComponent
									pagination
									page={page}
									setPage={setPage}
									data={formattedPublisherDetail.selfPublisherIdentifier.filter(item => item.free).map(item => tableSelfPublisherData(item))}
									headRows={headRowsSelfPublisherIdentifier}
									handleDelete={handleDelete}
								/>}
						</Grid>
					</Grid>
				</>
			);
	}

	const handlePublisherUpdate = values => {
		const token = cookie[COOKIE_NAME];
		if (assignRange) {
			const {_id, publisherRangeId, publisherIdentifier, ...updateValues} = publisher;
			if (Object.keys(range).length > 0) {
				const newPublisher = {
					...updateValues,
					publisherRangeId: publisherRangeId ? [...publisherRangeId, newPublisherRangeId] : [newPublisherRangeId],
					publisherIdentifier: publisherIdentifier ? formatPublisherIdentifier(publisherIdentifier, range.publisherIdentifier) : [range.publisherIdentifier]
				};
				updatePublisher(_id, {...newPublisher}, token, lang);
			}
		} else {
			const {_id, alias, ...updateValues} = values;
			const newClassification = values.classification.map(item => item.value.toString());
			updatePublisher(_id, {...updateValues, classification: newClassification}, token, lang);
			setIsEdit(false);
		}

		setIsEdit(false);
		setAssignRange(false);
	};

	function formatPublisherIdentifier(old, newValue) {
		return old.includes(newValue) ? old : [...old, newValue];
	}

	function handleOnClickProceedings() {
		history.push(`/publishers/proceedings/${id}`);
	}

	function handleOnClickMessages() {
		history.push({pathname: `/publishers/sentMessages/${id}`, state: {prevPath: `/publishers/${id}`, email: publisher.email}});
	}

	function tablePublisherData(item) {
		if (subRangeList !== undefined) {
			const result = subRangeList.length > 0 && subRangeList.find(range => item === range.publisherIdentifier);
			if (result) {
				const {free, next, active} = result !== false && result !== undefined && result;
				return {
					checkbox: '',
					publisherIdentifier: item,
					free: free,
					next: next,
					active: active,
					type: result.isbnRangeId ? 'ISBN' : 'ISMN',
					id: item
				};
			}

			return {
				checkbox: '',
				publisherIdentifier: item,
				free: '',
				next: '',
				active: '',
				type: '',
				id: item
			};
		}
	}

	function tableSelfPublisherData(item) {
		return {
			empty: '',
			identifier: item.identifier,
			publicationType: item.publicationType
		};
	}

	const component = (
		<Grid item xs={12}>
			<Typography variant="h5" className={classes.titleTopSticky}>
				{formattedPublisherDetail.name ? formattedPublisherDetail.name : ''}&nbsp;
				<FormattedMessage id="listComponent.publisherDetails"/>
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
									<Button variant="contained" color="primary" onClick={handleSubmit(handlePublisherUpdate)}>
										<FormattedMessage id="form.button.label.update"/>
									</Button>
								</div>
								<Grid container spacing={3} className={classes.listItemSpinner}>
									{publisherDetail}
								</Grid>
							</form>
						</div> :
						<div className={classes.listItem}>
							{assignRange ?
								<>
									<>
										{
											!enableUpdate &&
												<Button
													variant="outlined"
													startIcon={<ArrowBackIosIcon/>}
													onClick={handleBack}
												>
													<FormattedMessage id="form.button.label.back"/>
												</Button>
										}
										<Button disabled={!enableUpdate} variant="outlined" color="primary" onClick={handlePublisherUpdate}>
											<FormattedMessage id="form.button.label.update"/>
										</Button>
									</>
									<SelectRange
										rangeType="range"
										setNewPublisherRangeId={setNewPublisherRangeId}
										setAssignRange={setAssignRange}
										tabsValue={tabsValue}
										setTabsValue={setTabsValue}
										{...props}
									/>
								</> :
								<>
									{
										isAuthenticated && userInfo.role === 'admin' &&
											<Grid container item xs={12}>
												{!formattedPublisherDetail.publicationPublisher &&
													<Grid item xs={2}>
														<Button disabled={disableAssign} className={classes.buttons} variant="outlined" color="primary" onClick={handleRange}>
															<FormattedMessage id="publisher.button.label.assignRanges"/>
														</Button>
													</Grid>}
												{
													publisher.publisherIdentifier && Object.keys(publisher.publisherIdentifier).length > 0 &&
														<Grid item xs={2}>
															<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickSendMessage}>
																<FormattedMessage id="button.label.sendMessage"/>
															</Button>
														</Grid>
												}
												<Grid item xs={2}>
													<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickMessages}>
														<FormattedMessage id="button.label.messages"/>
													</Button>
												</Grid>
												<Grid item xs={2}>
													<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleOnClickProceedings}>
														<FormattedMessage id="button.label.proceedings"/>
													</Button>
												</Grid>
												<Grid item xs={2}>
													<PrintElement componentRef={componentRef}/>
												</Grid>
												<Grid item xs={2}>
													<Fab
														color="secondary"
														size="small"
														title={intl.formatMessage({id: 'user.fab.label.editUser'})}
														onClick={handleEditClick}
													>
														<EditIcon/>
													</Fab>
												</Grid>
											</Grid>
									}
									{
										isAuthenticated && userInfo.role === 'publisher' &&
											<Grid container item xs={12}>
												<Grid item xs={2}>
													<PrintElement componentRef={componentRef}/>
												</Grid>
												<Grid item xs={2}>
													<Button className={classes.buttons} variant="outlined" color="primary" onClick={handleRequestIsbn}>
														<FormattedMessage id="button.label.requestIsbn"/>
													</Button>
												</Grid>
												<Grid item xs={2}>
													<Fab
														color="secondary"
														size="small"
														title={intl.formatMessage({id: 'user.fab.label.editUser'})}
														onClick={handleEditClick}
													>
														<EditIcon/>
													</Fab>
												</Grid>
											</Grid>
									}
									<RootRef rootRef={componentRef}>
										<Grid container spacing={3} className={classes.listItemSpinner}>
											{publisherDetail}
										</Grid>
									</RootRef>
									{
										message &&
											<AlertDialogs
												openAlert={openAlert}
												setOpenAlert={setOpenAlert}
												message={message}
												setMessage={setMessage}
												handleOnAgree={handleOnAgree}
												handleOnCancel={handleOnCancel}
											/>
									}
								</>}
						</div>
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
		publisher: state.publisher.publisher,
		publisherUpdated: state.publisher.publisherUpdated,
		loading: state.publisher.loading,
		initialValues: formatInitialValues(state.publisher.publisher),
		isAuthenticated: state.login.isAuthenticated,
		range: state.identifierRanges.range,
		subRangeList: state.identifierRanges.rangesList,
		rangeListLoading: state.identifierRanges.rangeListLoading,
		userInfo: state.login.userInfo
	});
}

function formatInitialValues(values) {
	if (Object.keys(values).length > 0) {
		const formattedValues = {
			...values,
			classification: values.classification ? values.classification.map(item => {
				return formatClassificationForEditing(Number(item));
			}) : []
		};

		return formattedValues;
	}

	function formatClassificationForEditing(v) {
		return classificationCodes.reduce((acc, k) => {
			if (k.value === v) {
				acc = k;
				return acc;
			}

			return acc;
		}, {});
	}
}
