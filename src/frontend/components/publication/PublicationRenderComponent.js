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
import React, {useEffect, useState} from 'react';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {
	Grid,
	Typography
} from '@material-ui/core';
import {useIntl, FormattedMessage} from 'react-intl';

import ListComponent from '../ListComponent';
import TableComponent from '../TableComponent';
import Spinner from '../Spinner';
import * as actions from '../../store/actions';
import AlertDialogs from '../AlertDialogs';

export default connect(mapStateToProps, actions)(props => {
	const {
		isbnIsmn,
		issn,
		publication,
		rangesList,
		isEdit,
		isEditable,
		clearFields,
		fetchPublisher,
		fetchedPublisher,
		fetchIDRList,
		headRowsMetadataReference,
		publisherLoading,
		revokePublication,
		publicationLoading,
		updatePublicationIsbnIsmn,
		userInfo,
		lang
	} = props;
	const intl = useIntl();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [message, setMessage] = useState(null);
	const [openAlert, setOpenAlert] = useState(false);
	const [selectedToRevoke, setSelectedToRevoke] = useState(null);
	const {_id, seriesDetails, id, ...formattedPublication} = {...publication, ...publication.seriesDetails};

	useEffect(() => {
		if (formattedPublication.publisher !== undefined) {
			fetchPublisher(formattedPublication.publisher, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchPublisher, formattedPublication.publisher, publicationLoading]);

	useEffect(() => {
		fetchIDRList({token: cookie[COOKIE_NAME]});
	}, [cookie, fetchIDRList, publicationLoading]);

	function handleOnAgree() {
		selectedToRevoke.forEach(async item => {
			const itemObject = publication.identifier.find(i => i.id === item);
			const result = await revokePublication({identifier: item, publisherId: publication.publisher, token: cookie[COOKIE_NAME]});
			const {_id, ...newPublicaiton} = {
				...publication,
				identifier: publication.identifier.filter(i => i.id !== item),
				metadataReference: publication.metadataReference.map(i => {
					if (i.format === itemObject.type) {
						return {
							...i,
							state: 'pending',
							update: true
						};
					}

					return i;
				})
			};
			if (result) {
				await updatePublicationIsbnIsmn(_id, newPublicaiton, cookie[COOKIE_NAME], lang);
				return fetchPublisher(formattedPublication.publisher, cookie[COOKIE_NAME]);
			}
		});
	}

	function formatValueforAssociatedRange(value) {
		return value.map(item => item.subRange ? item.subRange : item.block);
	}

	const headRowsIdentifier = [
		{id: 'checkbox', label: ''},
		{id: 'identifier', label: <FormattedMessage id="publication.identifier.headRows.identifier"/>},
		{id: 'publicationType', label: <FormattedMessage id="publication.identifier.headRows.publicationType"/>}
	];

	function tableUserDataMetadataReference(item) {
		const keys = headRowsMetadataReference.map(k => k.id);
		const result = keys.reduce((acc, key) => {
			if (key === 'id') {
				return {...acc, format: item.format};
			}

			if (key === 'identifier') {
				return {...acc, identifier: item.id};
			}

			return {...acc, [key]: item[key]};
		}, {});

		return {
			format: result.format,
			state: result.state,
			status: result.status,
			identifier: result.identifier ? result.identifier : '',
			id: result.format
		};
	}

	function tableUserDataIdentifier(item) {
		const result = rangesList.length > 0 && rangesList !== undefined && rangesList.find(range => item.id === range.identifier);
		if (result) {
			const {identifier, publicationType} = result !== false && result !== undefined && result;
			return {
				identifier,
				publicationType,
				id: item.id
			};
		}

		return {
			identifier: '',
			publicationType: '',
			id: item.id
		};
	}

	function handleIsbnIsmnDelete(value) {
		setMessage(intl.formatMessage({id: 'publication.isbn.identifier.confirmation.message.revoke'}));
		setSelectedToRevoke(value);
	}

	let publicationDetail;
	if (formattedPublication === undefined || publisherLoading) {
		publicationDetail = <Spinner/>;
	} else {
		publicationDetail = (
			<>
				<Grid container item xs={12} spacing={2}>
					{issn && issnElements(publication)}
					{isbnIsmn && isbnIsmnElements(publication)}
				</Grid>
			</>
		);
	}

	return publicationDetail;

	function issnElements(publication) {
		return (
			<>
				<Grid container item xs={6} md={6} spacing={2}>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.basicInformation'})}
						</Typography>
						<hr/>
						<ListComponent edit={isEdit && isEditable} fieldName="title" label={intl.formatMessage({id: 'listComponent.title'})} value={publication.title ? publication.title : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="subtitle" label={intl.formatMessage({id: 'listComponent.subtitle'})} value={publication.subtitle ? publication.subtitle : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="language" label={intl.formatMessage({id: 'listComponent.language'})} value={publication.language ? publication.language : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="manufacturer" label={intl.formatMessage({id: 'listComponent.manufacturer'})} value={publication.manufacturer ? publication.manufacturer : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="city" label={intl.formatMessage({id: 'listComponent.city'})} value={publication.city ? publication.city : ''}/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.publisher'})}
						</Typography>
						<hr/>
						<>
							<ListComponent
								edit={isEdit && isEditable('publisher[name]')}
								fieldName="publisher[name]"
								label={intl.formatMessage({id: 'listComponent.name'})}
								value={fetchedPublisher.name ? fetchedPublisher.name : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[code]')}
								fieldName="publisher[code]"
								label={intl.formatMessage({id: 'listComponent.code'})}
								value={fetchedPublisher.code ? fetchedPublisher.code : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[phone]')}
								fieldName="publisher[phone]"
								label={intl.formatMessage({id: 'listComponent.phone'})}
								value={fetchedPublisher.phone ? fetchedPublisher.phone : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[language]')}
								fieldName="publisher[language]"
								label={intl.formatMessage({id: 'listComponent.language'})}
								value={fetchedPublisher.language ? fetchedPublisher.language : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[email]')}
								fieldName="publisher[email]"
								label={intl.formatMessage({id: 'listComponent.email'})}
								value={fetchedPublisher.email ? fetchedPublisher.email : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[contactPerson]')}
								fieldName="publisher[contactPerson]"
								label={intl.formatMessage({id: 'listComponent.contactPerson'})}
								value={fetchedPublisher.contactPerson ? fetchedPublisher.contactPerson : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[publisherType]')}
								fieldName="publisher[publisherType]"
								label={intl.formatMessage({id: 'listComponent.publisherType'})}
								value={fetchedPublisher.publisherType ? fetchedPublisher.publisherType : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][address]')}
								fieldName="publisher[postalAddress][address]"
								label={intl.formatMessage({id: 'listComponent.address'})}
								value={fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.address ?
									fetchedPublisher.postalAddress.address : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][city]')}
								fieldName="publisher[postalAddress][city]"
								label={intl.formatMessage({id: 'listComponent.city'})}
								value={fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.city ?
									fetchedPublisher.postalAddress.city : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][zip]')}
								fieldName="publisher[postalAddress][zip]"
								label={intl.formatMessage({id: 'listComponent.zip'})}
								value={fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.zip ?
									fetchedPublisher.postalAddress.zip : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][public]')}
								fieldName="publisher[postalAddress][public]"
								label={intl.formatMessage({id: 'listComponent.public'})}
								value={Boolean(fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.public)}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[aliases]')}
								fieldName="publisher[aliases]"
								clearFields={clearFields}
								label={intl.formatMessage({id: 'listComponent.aliases'})}
								value={fetchedPublisher.aliases ? fetchedPublisher.aliases : ''}
							/>
							{
								userInfo.role === 'admin' &&
									<ListComponent
										edit={isEdit && isEditable('publisher[earlierName]')}
										fieldName="publisher[earlierName]"
										clearFields={clearFields}
										label={intl.formatMessage({id: 'listComponent.earlierName'})}
										value={fetchedPublisher.earlierName ? fetchedPublisher.earlierName : ''}
									/>
							}
						</>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.mainSeries'})}
						</Typography>
						<hr/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[mainSeries][title]"
							label={intl.formatMessage({id: 'listComponent.title'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.mainSeries ?
									(publication.seriesDetails.mainSeries.title ?
										publication.seriesDetails.mainSeries.title :
										''
									) :
									''
								) :	''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[mainSeries][identifier]"
							label={intl.formatMessage({id: 'listComponent.identifier'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.mainSeries ?
									(publication.seriesDetails.mainSeries.identifier ?
										publication.seriesDetails.mainSeries.identifier :
										''
									) :
									''
								) : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.subSeries'})}
						</Typography>
						<hr/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[subSeries][title]"
							label={intl.formatMessage({id: 'listComponent.title'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.subSeries ?
									(publication.seriesDetails.subSeries.title ?
										publication.seriesDetails.subSeries.title :
										''
									) :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[subSeries][identifier]"
							label={intl.formatMessage({id: 'listComponent.identifier'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.subSeries ?
									(publication.seriesDetails.subSeries.identifier ?
										publication.seriesDetails.subSeries.identifier :
										''
									) :
									''
								) : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.formatDetails'})}
						</Typography>
						<hr/>
						{
							publication.formatDetails && publication.formatDetails.map(item => (
								<Grid key={item._id} item xs={12}>
									<ListComponent
										label={intl.formatMessage({id: 'listComponent.selectFormat'})}
										value={item.format ? item.format : ''}
									/>
									{item.url &&
										<ListComponent
											label={intl.formatMessage({id: 'listComponent.website'})}
											value={item.url ? item.url : ''}
										/>}
								</Grid>
							))
						}
					</Grid>
				</Grid>
				<Grid container item xs={6} md={6} spacing={2}>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.publicationTime'})}
						</Typography>
						<hr/>
						<ListComponent edit={isEdit && isEditable} fieldName="firstYear" label={intl.formatMessage({id: 'listComponent.firstYear'})} value={publication.firstYear ? publication.firstYear : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="firstNumber" label={intl.formatMessage({id: 'listComponent.firstNumber'})} value={publication.firstNumber ? publication.firstNumber : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="frequency" label={intl.formatMessage({id: 'listComponent.ISSN.frequency'})} value={publication.frequency ? publication.frequency : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="type" label={intl.formatMessage({id: 'listComponent.type'})} value={publication.type ? publication.type : ''}/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.previousPublication'})}
						</Typography>
						<hr/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="previousPublication[lastYear]"
							label={intl.formatMessage({id: 'listComponent.lastYear'})}
							value={publication.previousPublication ?
								(publication.previousPublication.lastYear ?
									publication.previousPublication.lastYear :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="previousPublication[lastNumber]"
							label={intl.formatMessage({id: 'listComponent.lastNumber'})}
							value={publication.previousPublication ?
								(publication.previousPublication.lastNumber ?
									publication.previousPublication.lastNumber :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="previousPublication[title]"
							label={intl.formatMessage({id: 'listComponent.title'})}
							value={publication.previousPublication ?
								(publication.previousPublication.title ?
									publication.previousPublication.title :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="previousPublication[identifier]"
							label={intl.formatMessage({id: 'listComponent.identifier'})}
							value={publication.previousPublication ?
								(publication.previousPublication.identifier ?
									publication.previousPublication.identifier :
									''
								) : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.identifier'})}
						</Typography>
						<hr/>
						{
							publication.identifier ?
								publication.identifier.map(item => (
									<div key={publication.identifier.id}>
										<ListComponent label={intl.formatMessage({id: 'listComponent.id'})} value={item.id}/>
										<ListComponent label={intl.formatMessage({id: 'listComponent.type'})} value={item.type}/>
									</div>
								)) :
								<Typography variant="body1">
									{intl.formatMessage({id: 'publicationRender.label.identifierNotAssigned'})}
								</Typography>
						}
					</Grid>
					{
						userInfo.role === 'admin' &&
							<>
								<Grid item xs={12}>
									<Typography variant="h6">
										{intl.formatMessage({id: 'publicationRender.label.metadataReference'})}
									</Typography>
									<hr/>
									{
										publication.metadataReference &&
											<TableComponent
												data={publication.metadataReference.map(item => tableUserDataMetadataReference(item))}
												headRows={headRowsMetadataReference}
											/>
									}
								</Grid>
								<Grid item xs={12}>
									<Typography variant="h6">
										{intl.formatMessage({id: 'publicationRender.label.otherReferences'})}
									</Typography>
									<hr/>
									<ListComponent label={intl.formatMessage({id: 'listComponent.associatedRange'})} value={publication.associatedRange ? formatValueforAssociatedRange(publication.associatedRange) : []}/>
									<ListComponent
										linkPath={`/requests/publications/issn/${publication.request}`}
										label={intl.formatMessage({id: 'listComponent.request'})}
										value={publication.request ? publication.request : ''}
									/>
									<ListComponent
										fieldName="timestamp"
										label={intl.formatMessage({id: 'listComponent.lastUpdated'})}
										value={publication.lastUpdated ?
											(publication.lastUpdated.timestamp ?
												publication.lastUpdated.timestamp :
												''
											) : ''}
									/>
									<ListComponent
										label={intl.formatMessage({id: 'listComponent.lastUpdatedBy'})}
										value={publication.lastUpdated ?
											(publication.lastUpdated.user ?
												publication.lastUpdated.user :
												''
											) : ''}
									/>
								</Grid>
							</>
					}
				</Grid>
			</>
		);
	}

	function isbnIsmnElements(publication) {
		return (
			<>
				<Grid container item xs={6} md={6} spacing={2}>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.basicInformation'})}
						</Typography>
						<hr/>
						<ListComponent edit={isEdit && isEditable} fieldName="title" label={intl.formatMessage({id: 'listComponent.title'})} value={publication.title ? publication.title : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="subtitle" label={intl.formatMessage({id: 'listComponent.subtitle'})} value={publication.subtitle ? publication.subtitle : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="language" label={intl.formatMessage({id: 'listComponent.language'})} value={publication.language ? publication.language : ''}/>
						<ListComponent edit={isEdit && isEditable} fieldName="publicationTime" label={intl.formatMessage({id: 'listComponent.publicationTime'})} value={publication.publicationTime ? publication.publicationTime : ''}/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.publisher'})}
						</Typography>
						<hr/>
						<>
							<ListComponent
								edit={isEdit && isEditable('publisher[name]')}
								fieldName="publisher[name]"
								label={intl.formatMessage({id: 'listComponent.name'})}
								value={fetchedPublisher.name ? fetchedPublisher.name : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[code]')}
								fieldName="publisher[code]"
								label={intl.formatMessage({id: 'listComponent.code'})}
								value={fetchedPublisher.code ? fetchedPublisher.code : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[phone]')}
								fieldName="publisher[phone]"
								label={intl.formatMessage({id: 'listComponent.phone'})}
								value={fetchedPublisher.phone ? fetchedPublisher.phone : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[language]')}
								fieldName="publisher[language]"
								label={intl.formatMessage({id: 'listComponent.language'})}
								value={fetchedPublisher.language ? fetchedPublisher.language : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[email]')}
								fieldName="publisher[email]"
								label={intl.formatMessage({id: 'listComponent.email'})}
								value={fetchedPublisher.email ? fetchedPublisher.email : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[contactPerson]')}
								fieldName="publisher[contactPerson]"
								label={intl.formatMessage({id: 'listComponent.contactPerson'})}
								value={fetchedPublisher.contactPerson ? fetchedPublisher.contactPerson : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[publisherType]')}
								fieldName="publisher[publisherType]"
								label={intl.formatMessage({id: 'listComponent.publisherType'})}
								value={fetchedPublisher.publisherType ? fetchedPublisher.publisherType : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][address]')}
								fieldName="publisher[postalAddress][address]"
								label={intl.formatMessage({id: 'listComponent.address'})}
								value={fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.address ?
									fetchedPublisher.postalAddress.address : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][city]')}
								fieldName="publisher[postalAddress][city]"
								label={intl.formatMessage({id: 'listComponent.city'})}
								value={fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.city ?
									fetchedPublisher.postalAddress.city : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[postalAddress][zip]')}
								fieldName="publisher[postalAddress][zip]"
								label={intl.formatMessage({id: 'listComponent.zip'})}
								value={fetchedPublisher && fetchedPublisher.postalAddress && fetchedPublisher.postalAddress.zip ?
									fetchedPublisher.postalAddress.zip : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[aliases]')}
								fieldName="publisher[aliases]"
								clearFields={clearFields}
								label={intl.formatMessage({id: 'listComponent.aliases'})}
								value={fetchedPublisher.aliases ? fetchedPublisher.aliases : ''}
							/>
							{
								userInfo.role === 'admin' &&
									<ListComponent
										edit={isEdit && isEditable('publisher[earlierName]')}
										fieldName="publisher[earlierName]"
										clearFields={clearFields}
										label={intl.formatMessage({id: 'listComponent.earlierName'})}
										value={fetchedPublisher.earlierName ? fetchedPublisher.earlierName : ''}
									/>
							}
							<ListComponent
								edit={isEdit && isEditable('publisher[publicationDetails][frequency][currentYear]')}
								fieldName="publisher[publicationDetails][frequency][currentYear]"
								label={intl.formatMessage({id: 'listComponent.currentYear'})}
								value={fetchedPublisher && fetchedPublisher.publicationDetails && fetchedPublisher.publicationDetails.frequency && fetchedPublisher.publicationDetails.frequency.currentYear ?
									fetchedPublisher.publicationDetails.frequency.currentYear : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[publicationDetails][frequency][nextYear]')}
								fieldName="publisher[publicationDetails][frequency][nextYear]"
								label={intl.formatMessage({id: 'listComponent.nextYear'})}
								value={fetchedPublisher && fetchedPublisher.publicationDetails && fetchedPublisher.publicationDetails.frequency && fetchedPublisher.publicationDetails.frequency.nextYear ?
									fetchedPublisher.publicationDetails.frequency.nextYear : ''}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[publicationDetails]previouslyPublished')}
								fieldName="publisher[publicationDetails]previouslyPublished"
								label={intl.formatMessage({id: 'listComponent.previouslyPublished'})}
								value={fetchedPublisher && fetchedPublisher.publicationDetails && Boolean(fetchedPublisher.publicationDetails.previouslyPublished)}
							/>
							<ListComponent
								edit={isEdit && isEditable('publisher[publicationDetails]publishingActivities')}
								fieldName="publisher[publicationDetails]publishingActivities"
								label={intl.formatMessage({id: 'listComponent.publishingActivities'})}
								value={fetchedPublisher && fetchedPublisher.publicationDetails && fetchedPublisher.publicationDetails.publishingActivities ?
									fetchedPublisher.publicationDetails.publishingActivities : ''}
							/>
						</>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.seriesDetails'})}
						</Typography>
						<hr/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[volume]"
							label={intl.formatMessage({id: 'listComponent.volume'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.volume ?
									publication.seriesDetails.volume :
									''
								) :	''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[title]"
							label={intl.formatMessage({id: 'listComponent.title'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.title ?
									publication.seriesDetails.title :
									''
								) :	''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="seriesDetails[identifier]"
							label={intl.formatMessage({id: 'listComponent.identifier'})}
							value={publication.seriesDetails ?
								(publication.seriesDetails.identifier ?
									publication.seriesDetails.identifier :
									''
								) :	''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.uniformDetails'})}
						</Typography>
						<hr/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="uniform[name]"
							label={intl.formatMessage({id: 'listComponent.name'})}
							value={publication.uniform && publication.uniform.name ? publication.uniform.name : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="uniform[language]"
							label={intl.formatMessage({id: 'listComponent.language'})}
							value={publication.uniform && publication.uniform.language ? publication.uniform.language : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.formatDetails'})}
						</Typography>
						<hr/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.selectFormat'})}
							value={publication.formatDetails ?
								(publication.formatDetails.format ?
									publication.formatDetails.format :
									''
								) : ''}
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.fileFormat'})}
							value={publication.formatDetails ?
								(publication.formatDetails.fileFormat && publication.formatDetails.fileFormat.format ?
									publication.formatDetails.fileFormat.format :
									''
								) : ''}
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.printFormat'})}
							value={publication.formatDetails ?
								(publication.formatDetails.printFormat && publication.formatDetails.printFormat.format ?
									publication.formatDetails.printFormat.format :
									''
								) : ''}
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.id'})}
							value={publication.formatDetails && publication.formatDetails.printFormat && publication.formatDetails.printFormat.metadata && publication.formatDetails.printFormat.metadata.id ?
								publication.formatDetails.printFormat.metadata.id : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="formatDetails[manufacturer]"
							label={intl.formatMessage({id: 'listComponent.manufacturer'})}
							value={publication.formatDetails ?
								(publication.formatDetails.manufacturer ?
									publication.formatDetails.manufacturer :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="formatDetails[city]"
							label={intl.formatMessage({id: 'listComponent.city'})}
							value={publication.formatDetails ?
								(publication.formatDetails.city ?
									publication.formatDetails.city :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="formatDetails[run]"
							label={intl.formatMessage({id: 'listComponent.run'})}
							value={publication.formatDetails ?
								(publication.formatDetails.run ?
									publication.formatDetails.run :
									''
								) : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="formatDetails[edition]"
							label={intl.formatMessage({id: 'listComponent.edition'})}
							value={publication.formatDetails ?
								(publication.formatDetails.edition ?
									publication.formatDetails.edition :
									''
								) : ''}
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.identifier'})}
							value={publication.formatDetails ?
								(publication.formatDetails.identifier ?
									publication.formatDetails.identifier :
									''
								) : ''}
						/>
					</Grid>
				</Grid>
				<Grid container item xs={6} md={6} spacing={2}>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.authorDetails'})}
						</Typography>
						<hr/>
						<ListComponent
							clearFields={clearFields}
							edit={isEdit && isEditable} fieldName="authors"
							value={publication.authors ? publication.authors : []}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.publicationDetails'})}
						</Typography>
						<hr/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="isbnClassification"
							label={intl.formatMessage({id: 'listComponent.isbnClassification'})}
							value={publication.isbnClassification ? publication.isbnClassification : ''}
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.publicationType'})}
							value={publication.publicationType ? publication.publicationType : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable} fieldName="isPublic"
							label={intl.formatMessage({id: 'listComponent.isPublic'})}
							value={publication.isPublic ? publication.isPublic : ''}
						/>
						<ListComponent
							edit={isEdit && isEditable && publication.type !== 'map' && publication.type !== 'dissertation'} fieldName="type"
							label={intl.formatMessage({id: 'listComponent.type'})}
							value={publication.type ? publication.type : ''}
							publication="isbn-ismn"
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.scale'})}
							value={publication.mapDetails ?
								(publication.mapDetails.scale ?
									publication.mapDetails.scale :
									''
								) : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.identifier'})}
						</Typography>
						<hr/>
						{
							publication.identifier && publication.identifier.length > 0 ?
								<TableComponent
									rowDeletable
									data={publication.identifier.map(item => tableUserDataIdentifier(item))}
									headRows={headRowsIdentifier}
									handleDelete={handleIsbnIsmnDelete}
								/>	:
								<Typography variant="body1">
									{intl.formatMessage({id: 'publicationRender.label.identifierNotAssigned'})}
								</Typography>
						}
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.metadataReference'})}
						</Typography>
						<hr/>
						{
							publication.metadataReference &&
								<TableComponent
									data={publication.metadataReference.map(item => tableUserDataMetadataReference(item))}
									headRows={headRowsMetadataReference}
								/>
						}
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.additionalDetails'})}
						</Typography>
						<hr/>
						<ListComponent edit={isEdit && isEditable} fieldName="additionalDetails" label={intl.formatMessage({id: 'listComponent.additionalDetails'})} value={publication.additionalDetails ? publication.additionalDetails : ''}/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.otherReferences'})}
						</Typography>
						<hr/>
						<ListComponent label={intl.formatMessage({id: 'listComponent.associatedRange'})} value={publication.associatedRange ? formatValueforAssociatedRange(publication.associatedRange) : []}/>
						<ListComponent
							linkPath={`/requests/publications/isbn-ismn/${publication.request}`}
							label={intl.formatMessage({id: 'listComponent.request'})}
							value={publication.request ? publication.request : ''}
						/>
						<ListComponent
							fieldName="timestamp"
							label={intl.formatMessage({id: 'listComponent.lastUpdated'})}
							value={publication.lastUpdated ?
								(publication.lastUpdated.timestamp ?
									publication.lastUpdated.timestamp :
									''
								) : ''}
						/>
						<ListComponent
							label={intl.formatMessage({id: 'listComponent.lastUpdatedBy'})}
							value={publication.lastUpdated ?
								(publication.lastUpdated.user ?
									publication.lastUpdated.user :
									''
								) : ''}
						/>
					</Grid>
				</Grid>
				{
					message &&
						<AlertDialogs
							openAlert={openAlert}
							setOpenAlert={setOpenAlert}
							message={message}
							setMessage={setMessage}
							handleOnAgree={handleOnAgree}
						/>
				}
			</>
		);
	}
});

function mapStateToProps(state) {
	return ({
		fetchedPublisher: state.publisher.publisher,
		publicationLoading: state.publication.loading,
		publisherLoading: state.publisher.loading,
		rangesList: state.identifierRanges.rangesList,
		userInfo: state.login.userInfo
	});
}
