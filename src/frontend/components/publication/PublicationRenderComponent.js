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
	Link,
	Typography
} from '@material-ui/core';
import {useIntl} from 'react-intl';

import ListComponent from '../ListComponent';
import TableComponent from '../TableComponent';
import Spinner from '../Spinner';
import * as actions from '../../store/actions';

export default connect(mapStateToProps, actions)(props => {
	const {
		isbnIsmn,
		issn,
		publication,
		isEdit,
		isEditable,
		clearFields,
		fetchPublisher,
		fetchedPublisher,
		rowSelectedId,
		handleTableRowClick,
		headRows,
		publisherLoading
	} = props;
	const intl = useIntl();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [publisherName, setPublisherName] = useState(null);

	const {_id, seriesDetails, id, ...formattedPublication} = {...publication, ...publication.seriesDetails};

	useEffect(() => {
		if (formattedPublication.publisher !== undefined) {
			fetchPublisher(formattedPublication.publisher, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchPublisher, formattedPublication.publisher]);

	useEffect(() => {
		if (Object.keys(fetchedPublisher).length > 0) {
			setPublisherName(fetchedPublisher.name);
		}
	}, [fetchedPublisher]);

	function formatValueforAssociatedRange(value) {
		return value.map(item => item.subRange ? item.subRange : item.block);
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
						<ListComponent label={intl.formatMessage({id: 'listComponent.publisherName'})} value={(publication.publisher && publisherName !== null) ? publisherName : ''}/>
						<Link href={`/publishers/${publication.publisher}`} color="primary" underline="always"> publisherDetails </Link>
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
						<ListComponent edit={isEdit && isEditable} fieldName="frequency" label={intl.formatMessage({id: 'listComponent.frequency'})} value={publication.frequency ? publication.frequency : ''}/>
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
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.metadataReference'})}
						</Typography>
						<hr/>
						{
							publication.metadataReference &&
								<TableComponent
									data={publication.metadataReference.map(item => tableUserData(item))}
									handleTableRowClick={handleTableRowClick}
									rowSelectedId={rowSelectedId}
									headRows={headRows}
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
				</Grid>
			</>
		);
	}

	function tableUserData(item) {
		const keys = headRows.map(k => k.id);
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
						<ListComponent label={intl.formatMessage({id: 'listComponent.publisherName'})} value={(publication.publisher && publisherName !== null) ? publisherName : ''}/>
						<Link href={`/publishers/${publication.publisher}`} color="primary" underline="always"> publisherDetails </Link>
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
						<ListComponent label={intl.formatMessage({id: 'listComponent.type'})} value={publication.type ? publication.type : ''}/>
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
					<Grid item xs={12}>
						<Typography variant="h6">
							{intl.formatMessage({id: 'publicationRender.label.metadataReference'})}
						</Typography>
						<hr/>
						{
							publication.metadataReference &&
								<TableComponent
									data={publication.metadataReference.map(item => tableUserData(item))}
									handleTableRowClick={handleTableRowClick}
									rowSelectedId={rowSelectedId}
									headRows={headRows}
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
			</>
		);
	}
});

function mapStateToProps(state) {
	return ({
		fetchedPublisher: state.publisher.publisher,
		publisherLoading: state.publisher.loading
	});
}
