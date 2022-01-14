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

import React from 'react';
import {FormattedMessage} from 'react-intl';
import ListComponent from '../../ListComponent';
import {Grid, Typography} from '@material-ui/core';

export default function renderPreview(publisherValues, intl) {
	return (
		<Grid container item spacing={2} xs={12}>
			<Grid container item xs={6} md={6} spacing={2}>
				<Grid item xs={12}>
					<Grid item xs={12}>
						<Typography variant="h6">
							<FormattedMessage id="listComponent.basicInformations"/>
						</Typography>
						<hr/>
						<ListComponent
							fieldName="name"
							label={intl.formatMessage({id: 'listComponent.name'})}
							value={publisherValues.name ? publisherValues.name : ''}
						/>
						<ListComponent
							fieldName="phone"
							label={intl.formatMessage({id: 'listComponent.phone'})}
							value={publisherValues.phone ? publisherValues.phone : ''}
						/>
						<ListComponent
							fieldName="publisherCategory"
							label={intl.formatMessage({id: 'listComponent.publisherCategory'})}
							value={publisherValues.publisherCategory ? publisherValues.publisherCategory.value : ''}
						/>
						<ListComponent
							fieldName="email"
							label={intl.formatMessage({id: 'listComponent.email'})}
							value={publisherValues.email ? publisherValues.email : ''}
						/>
						<ListComponent
							fieldName="contactPerson"
							label={intl.formatMessage({id: 'listComponent.contactPerson'})}
							value={publisherValues.contactPerson ? publisherValues.contactPerson : ''}
						/>
						<ListComponent
							fieldName="website"
							label={intl.formatMessage({id: 'listComponent.website'})}
							value={publisherValues.website ? publisherValues.website : ''}
						/>
					</Grid>
					<Grid item xs={12}>
						<Typography variant="h6">
							<FormattedMessage id="listComponent.postalAddress"/>
						</Typography>
						<hr/>
						<ListComponent
							fieldName="postalAddress[address]"
							label={intl.formatMessage({id: 'listComponent.address'})}
							value={
								publisherValues &&
								publisherValues.postalAddress &&
								publisherValues.postalAddress.address ? publisherValues.postalAddress.address : ''
							}
						/>
						<ListComponent
							fieldName="postalAddress[zip]"
							label={intl.formatMessage({id: 'listComponent.zip'})}
							value={
								publisherValues &&
								publisherValues.postalAddress &&
								publisherValues.postalAddress.zip ? publisherValues.postalAddress.zip : ''
							}
						/>
						<ListComponent
							fieldName="postalAddress[city]"
							label={intl.formatMessage({id: 'listComponent.city'})}
							value={
								publisherValues &&
								publisherValues.postalAddress &&
								publisherValues.postalAddress.city ? publisherValues.postalAddress.city : ''
							}
						/>
						{/* <ListComponent
                            fieldName="postalAddress[public]"
                            label={intl.formatMessage({id: 'listComponent.public'})}
                            value={publisherValues && publisherValues.postalAddress && publisherValues.postalAddress.public ?
                                publisherValues.postalAddress.public : ''}
                        /> */}
					</Grid>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.organizationDetails"/>
					</Typography>
					<hr/>
					<ListComponent
						fieldName="organizationalDetails[affiliate]"
						label={intl.formatMessage({id: 'listComponent.affiliate'})}
						value={
							publisherValues &&
							publisherValues.organizationDetails &&
							publisherValues.organizationDetails.affiliate ? publisherValues.organizationDetails.affiliate : ''
						}
					/>
					<ListComponent
						fieldName="organizationalDetails[distributor]"
						label={intl.formatMessage({id: 'listComponent.distributor'})}
						value={
							publisherValues &&
							publisherValues.organizationDetails &&
							publisherValues.organizationDetails.distributor ? publisherValues.organizationDetails.distributor : ''
						}
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
						fieldName="aliases"
						label={intl.formatMessage({id: 'listComponent.aliases'})}
						value={publisherValues.aliases ? publisherValues.aliases : ''}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.earlierName"/>
					</Typography>
					<hr/>
					<ListComponent
						fieldName="earlierName"
						label={intl.formatMessage({id: 'listComponent.earlierName'})}
						value={publisherValues.earlierName ? publisherValues.earlierName : ''}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.publishingFrequency"/>
					</Typography>
					<hr/>
					<ListComponent
						fieldName="publicationDetails[frequency][currentYear]"
						label={intl.formatMessage({id: 'listComponent.currentYear'})}
						value={
							publisherValues &&
							publisherValues.publicationDetails &&
							publisherValues.publicationDetails.frequency &&
							publisherValues.publicationDetails.frequency.currentYear ? publisherValues.publicationDetails.frequency.currentYear : ''
						}
					/>
					<ListComponent
						fieldName="publicationDetails[frequency][currentYear]"
						label={intl.formatMessage({id: 'listComponent.nextYear'})}
						value={
							publisherValues &&
							publisherValues.publicationDetails &&
							publisherValues.publicationDetails.frequency &&
							publisherValues.publicationDetails.frequency.nextYear ? publisherValues.publicationDetails.frequency.nextYear : ''
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<Typography variant="h6">
						<FormattedMessage id="listComponent.classification"/>
					</Typography>
					<hr/>
					<Grid container style={{display: 'flex', flexDirection: 'column'}}>
						<ListComponent
							fieldName="classification"
							label={intl.formatMessage({id: 'listComponent.classification'})}
							value={publisherValues.classification ? publisherValues.classification.map(i => i.value) : []}
						/>
					</Grid>
				</Grid>
				{/* <Grid item xs={12}>
                    <Typography variant="h6">
                        <FormattedMessage id="listComponent.notes"/>
                    </Typography>
                    <hr/>
                    <ListComponent
                        fieldName="notes"
                        label={intl.formatMessage({id: 'listComponent.notes'})}
                        value={publisherValues.notes ? publisherValues.notes : ''}
                    />
                </Grid> */}
			</Grid>
		</Grid>
	);
}
