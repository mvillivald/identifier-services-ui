import React from 'react';
import moment from 'moment';
import {Button, Grid, Typography} from '@material-ui/core';
import {FormattedMessage} from 'react-intl';

import ListComponent from '../../ListComponent';

import {formatPublicationValues} from './utils';

/* eslint-disable complexity */
// eslint-disable-next-line max-params
export function renderPreview(publicationValues, isAuthenticated, user, intl, clearFields) {
	publicationValues = {
		...publicationValues,
		publicationTime: publicationValues.publicationTime
	};
	const formatPublicationValue = publicationValues.isbnClassification ?
		{
			...formatPublicationValues(publicationValues, isAuthenticated, user, intl),
			isbnClassification: publicationValues.isbnClassification.map(item => item.label.toString())
		} : formatPublicationValues(publicationValues, isAuthenticated, user, intl);
	return (
		<Grid container item spacing={2} xs={12}>
			<Grid container item xs={6} md={6} spacing={2}>
				<Grid item xs={12}>
					<Grid item xs={12}>
						<Typography variant="h6">
							<FormattedMessage id="listComponent.basicInformations"/>
						</Typography>
						<hr/>
						<ListComponent label={intl.formatMessage({id: 'listComponent.title'})} value={formatPublicationValue.title ? formatPublicationValue.title : ''}/>
						<ListComponent label={intl.formatMessage({id: 'listComponent.subtitle'})} value={formatPublicationValue.subtitle ? formatPublicationValue.subtitle : ''}/>
						<ListComponent label={intl.formatMessage({id: 'listComponent.publicationTime'})} value={formatPublicationValue.publicationTime ? moment(formatPublicationValue.publicationTime).format('YYYY/MM') : ''}/>
					</Grid>
					{
						user.role !== 'publisher' &&
							<Grid item xs={12}>
								<Typography variant="h6">
									<FormattedMessage id="listComponent.publisher"/>&nbsp;
									<FormattedMessage id="listComponent.informations"/>
								</Typography>
								<hr/>
								{
									formatPublicationValue.publicationType === 'dissertation' ?
										(
											<>
												<ListComponent
													label={intl.formatMessage({id: 'listComponent.name'})}
													value={formatPublicationValue.selectUniversity && formatPublicationValue.selectUniversity.title ? formatPublicationValue.selectUniversity.title : ''}
												/>
												<ListComponent
													label={intl.formatMessage({id: 'listComponent.place'})}
													value={formatPublicationValue.selectUniversity && formatPublicationValue.selectUniversity.place ? formatPublicationValue.selectUniversity.place : ''}
												/>
											</>
										) : (
											<>
												<ListComponent
													label={intl.formatMessage({id: 'listComponent.name'})}
													value={formatPublicationValue.publisher && formatPublicationValue.publisher.name ? formatPublicationValue.publisher.name : ''}
												/>
												<ListComponent
													label={intl.formatMessage({id: 'listComponent.code'})}
													value={formatPublicationValue.publisher && formatPublicationValue.publisher.code ? formatPublicationValue.publisher.code : ''}
												/>
											</>
										)
								}
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.address'})}
									value={formatPublicationValue.publisher && formatPublicationValue.publisher.postalAddress && formatPublicationValue.publisher.postalAddress ?
										formatPublicationValue.publisher.postalAddress.address && formatPublicationValue.publisher.postalAddress.address :
										(formatPublicationValue.publisher && formatPublicationValue.publisher.address ?
											formatPublicationValue.publisher.address :
											'')}
								/>
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.zip'})}
									value={formatPublicationValue.publisher && formatPublicationValue.publisher.postalAddress && formatPublicationValue.publisher.postalAddress ?
										formatPublicationValue.publisher.postalAddress.zip && formatPublicationValue.publisher.postalAddress.zip :
										(formatPublicationValue.publisher && formatPublicationValue.publisher.zip ?
											formatPublicationValue.publisher.zip :
											'')}
								/>
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.city'})}
									value={formatPublicationValue.publisher && formatPublicationValue.publisher.postalAddress && formatPublicationValue.publisher.postalAddress ?
										formatPublicationValue.publisher.postalAddress.city && formatPublicationValue.publisher.postalAddress.city :
										(formatPublicationValue.publisher && formatPublicationValue.publisher.city ?
											formatPublicationValue.publisher.city :
											'')}
								/>
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.contactPerson'})}
									value={formatPublicationValue.publisher && formatPublicationValue.publisher.contactPerson ? formatPublicationValue.publisher.contactPerson : ''}
								/>
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.phone'})}
									value={formatPublicationValue.publisher && formatPublicationValue.publisher.phone ? formatPublicationValue.publisher.phone : ''}
								/>
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.email'})}
									value={formatPublicationValue.publisher && formatPublicationValue.publisher.email ? formatPublicationValue.publisher.email : ''}
								/>
								{
									formatPublicationValue.publicationType === 'dissertation' ?
										<ListComponent
											label={intl.formatMessage({id: 'listComponent.language'})}
											value={formatPublicationValue.language ? formatPublicationValue.language : ''}
										/> :
										<ListComponent
											label={intl.formatMessage({id: 'listComponent.language'})}
											value={formatPublicationValue.publisher && formatPublicationValue.publisher.language ? formatPublicationValue.publisher.language : ''}
										/>
								}
							</Grid>
					}
				</Grid>
				{
					(formatPublicationValue.publicationType !== 'dissertation' && formatPublicationValue.publicationType !== 'map') &&
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.publisher"/>&nbsp;
								<FormattedMessage id="listComponent.publishingActivities"/>
							</Typography>
							<hr/>
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.currentYear'})}
								value={formatPublicationValue.publisher && formatPublicationValue.publisher.publicationDetails && formatPublicationValue.publisher.publicationDetails.frequency &&
									formatPublicationValue.publisher.publicationDetails.frequency.currentYear ? formatPublicationValue.publisher.publicationDetails.frequency.currentYear : ''}
							/>
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.nextYear'})}
								value={formatPublicationValue.publisher && formatPublicationValue.publisher.publicationDetails && formatPublicationValue.publisher.publicationDetails.frequency &&
									formatPublicationValue.publisher.publicationDetails.frequency.nextYear ? formatPublicationValue.publisher.publicationDetails.frequency.nextYear : ''}
							/>
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.previouslyPublished'})}
								value={formatPublicationValue.publisher && formatPublicationValue.publisher.publicationDetails && formatPublicationValue.publisher.publicationDetails.previouslyPublished ?
									formatPublicationValue.publisher.publicationDetails.previouslyPublished : ''}
							/>
							<ListComponent
								fieldName="publishingActivities"
								label={intl.formatMessage({id: 'listComponent.publishingActivities'})}
								value={formatPublicationValue.publisher && formatPublicationValue.publisher.publicationDetails && formatPublicationValue.publisher.publicationDetails.publishingActivities ?
									formatPublicationValue.publisher.publicationDetails.publishingActivities : ''}
							/>
						</Grid>
				}
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.authors"/>
					</Typography>
					<hr/>
					<ListComponent
						clearFields={clearFields}
						fieldName="authors"
						value={formatPublicationValue.authors ? formatPublicationValue.authors : []}
					/>
				</Grid>
			</Grid>
			<Grid container item xs={6} md={6} spacing={2}>
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.publicationDetails"/>
					</Typography>
					<hr/>
					{
						(formatPublicationValue.publicationType !== 'dissertation' && formatPublicationValue.publicationType !== 'map') &&
							<Grid container style={{display: 'flex', flexDirection: 'column'}}>
								<ListComponent
									label={intl.formatMessage({id: 'listComponent.classification'})}
									value={formatPublicationValue.isbnClassification ? formatPublicationValue.isbnClassification : []}
								/>
							</Grid>
					}
					{
						user.role !== 'publisher' &&
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.isPublic'})}
								value={formatPublicationValue.isPublic ? formatPublicationValue.isPublic : ''}
							/>
					}
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.type'})}
						value={formatPublicationValue.publicationType ? formatPublicationValue.publicationType : ''}
					/>
					{
						formatPublicationValue.publicationType === 'map' &&
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.scale'})}
								value={formatPublicationValue.scale ? formatPublicationValue.scale : ''}
							/>
					}
				</Grid>

				{/* <Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.uniformDetails"/>
					</Typography>
					<hr/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.name'})}
						value={formatPublicationValue.uniform && formatPublicationValue.uniform.name ? formatPublicationValue.uniform.name : ''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.language'})}
						value={formatPublicationValue.uniform && formatPublicationValue.uniform.language ? formatPublicationValue.uniform.language : ''}
					/>
				</Grid> */}
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.seriesDetails"/>
					</Typography>
					<hr/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.volume'})}
						value={formatPublicationValue.seriesDetails ?
							(formatPublicationValue.seriesDetails.volume ?
								formatPublicationValue.seriesDetails.volume :
								''
							) :	''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.title'})}
						value={formatPublicationValue.seriesDetails ?
							(formatPublicationValue.seriesDetails.title ?
								formatPublicationValue.seriesDetails.title :
								''
							) :	''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.identifier'})}
						value={formatPublicationValue.seriesDetails ?
							(formatPublicationValue.seriesDetails.identifier ?
								formatPublicationValue.seriesDetails.identifier :
								''
							) :	''}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.formatDetails"/>
					</Typography>
					<hr/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.selectFormat'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.format ?
								formatPublicationValue.formatDetails.format :
								''
							) : ''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.fileFormat'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.fileFormat && formatPublicationValue.formatDetails.fileFormat.format ?
								formatPublicationValue.formatDetails.fileFormat.format :
								''
							) : ''}
					/>
					{
						formatPublicationValue.formatDetails && formatPublicationValue.formatDetails.otherFileFormat && formatPublicationValue.formatDetails.otherFileFormat.one &&
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.otherFileFormat'})}
								value={formatPublicationValue.formatDetails.otherFileFormat.one}
							/>
					}
					{
						formatPublicationValue.formatDetails && formatPublicationValue.formatDetails.otherFileFormat && formatPublicationValue.formatDetails.otherFileFormat.two &&
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.otherFileFormat'})}
								value={formatPublicationValue.formatDetails.otherFileFormat.two}
							/>
					}
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.printFormat'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.printFormat && formatPublicationValue.formatDetails.printFormat.format ?
								formatPublicationValue.formatDetails.printFormat.format :
								''
							) : ''}
					/>
					{
						formatPublicationValue.formatDetails && formatPublicationValue.formatDetails.otherPrintFormat && formatPublicationValue.formatDetails.otherPrintFormat.one &&
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.otherPrintFormat'})}
								value={formatPublicationValue.formatDetails.otherPrintFormat.one}
							/>
					}
					{
						formatPublicationValue.formatDetails && formatPublicationValue.formatDetails.otherPrintFormat && formatPublicationValue.formatDetails.otherPrintFormat.two &&
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.otherPrintFormat'})}
								value={formatPublicationValue.formatDetails.otherPrintFormat.two}
							/>
					}
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.manufacturer'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.manufacturer ?
								formatPublicationValue.formatDetails.manufacturer :
								''
							) : ''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.city'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.city ?
								formatPublicationValue.formatDetails.city :
								''
							) : ''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.run'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.run ?
								formatPublicationValue.formatDetails.run :
								''
							) : ''}
					/>
					<ListComponent
						label={intl.formatMessage({id: 'listComponent.edition'})}
						value={formatPublicationValue.formatDetails ?
							(formatPublicationValue.formatDetails.edition ?
								formatPublicationValue.formatDetails.edition :
								''
							) : ''}
					/>
				</Grid>
				{
					user.role !== 'publisher' &&
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.additionalDetails"/>
							</Typography>
							<hr/>
							<ListComponent
								value={formatPublicationValue.additionalDetails ? formatPublicationValue.additionalDetails : ''}
							/>
						</Grid>
				}
			</Grid>
			<Button type="submit" variant="contained" color="primary">
				<FormattedMessage id="form.button.label.submit"/>
			</Button>
		</Grid>
	);
}
