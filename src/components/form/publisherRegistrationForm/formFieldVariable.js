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
import {PAGES} from './constants';
import {FormattedMessage} from 'react-intl';
import {Typography} from '@material-ui/core';

export const classificationCodes = [
	{label: <FormattedMessage id="publisher.classification.general"/>, value: 0},
	{label: <FormattedMessage id="publisher.classification.book-business-lib"/>, value: 15},
	{label: <FormattedMessage id="publisher.classification.text-books"/>, value: 30},
	{label: <FormattedMessage id="publisher.classification.children-book"/>, value: 35},
	{label: <FormattedMessage id="publisher.classification.official-publication"/>, value: 40},
	{label: <FormattedMessage id="publisher.classification.university-publication"/>, value: 45},
	{label: <FormattedMessage id="publisher.classification.electronic-publication"/>, value: 50},
	{label: <FormattedMessage id="publisher.classification.audiovisual"/>, value: 55},
	{label: <FormattedMessage id="publisher.classification.philosophy"/>, value: 100},
	{label: <FormattedMessage id="publisher.classification.psychology"/>, value: 120},
	{label: <FormattedMessage id="publisher.classification.paranormal"/>, value: 130},
	{label: <FormattedMessage id="publisher.classification.religion"/>, value: 200},
	{label: <FormattedMessage id="publisher.classification.christianity"/>, value: 210},
	{label: <FormattedMessage id="publisher.classification.orthodox"/>, value: 211},
	{label: <FormattedMessage id="publisher.classification.other-religions"/>, value: 270},
	{label: <FormattedMessage id="publisher.classification.social-science"/>, value: 300},
	{label: <FormattedMessage id="publisher.classification.political-studies"/>, value: 310},
	{label: <FormattedMessage id="publisher.classification.military"/>, value: 315},
	{label: <FormattedMessage id="publisher.classification.sociology"/>, value: 316},
	{label: <FormattedMessage id="publisher.classification.economics"/>, value: 320},
	{label: <FormattedMessage id="publisher.classification.law"/>, value: 330},
	{label: <FormattedMessage id="publisher.classification.public-administration"/>, value: 340},
	{label: <FormattedMessage id="publisher.classification.education"/>, value: 350},
	{label: <FormattedMessage id="publisher.classification.ethnography"/>, value: 370},
	{label: <FormattedMessage id="publisher.classification.local-history"/>, value: 375},
	{label: <FormattedMessage id="publisher.classification.social-politics"/>, value: 380},
	{label: <FormattedMessage id="publisher.classification.mass-media"/>, value: 390},
	{label: <FormattedMessage id="publisher.classification.literature"/>, value: 400},
	{label: <FormattedMessage id="publisher.classification.fiction"/>, value: 410},
	{label: <FormattedMessage id="publisher.classification.poetry"/>, value: 420},
	{label: <FormattedMessage id="publisher.classification.cartoons"/>, value: 440},
	{label: <FormattedMessage id="publisher.classification.science-fiction"/>, value: 450},
	{label: <FormattedMessage id="publisher.classification.crime-fiction"/>, value: 460},
	{label: <FormattedMessage id="publisher.classification.linguistic"/>, value: 470},
	{label: <FormattedMessage id="publisher.classification.sexual-minorities"/>, value: 480},
	{label: <FormattedMessage id="publisher.classification.minorities"/>, value: 490},
	{label: <FormattedMessage id="publisher.classification.science"/>, value: 500},
	{label: <FormattedMessage id="publisher.classification.mathematics"/>, value: 510},
	{label: <FormattedMessage id="publisher.classification.astronomy"/>, value: 520},
	{label: <FormattedMessage id="publisher.classification.physics"/>, value: 530},
	{label: <FormattedMessage id="publisher.classification.chemistry"/>, value: 540},
	{label: <FormattedMessage id="publisher.classification.geology"/>, value: 550},
	{label: <FormattedMessage id="publisher.classification.biology"/>, value: 560},
	{label: <FormattedMessage id="publisher.classification.zoology"/>, value: 570},
	{label: <FormattedMessage id="publisher.classification.botany"/>, value: 580},
	{label: <FormattedMessage id="publisher.classification.environmental-studies"/>, value: 590},
	{label: <FormattedMessage id="publisher.classification.technology"/>, value: 600},
	{label: <FormattedMessage id="publisher.classification.engineering"/>, value: 610},
	{label: <FormattedMessage id="publisher.classification.industry"/>, value: 620},
	{label: <FormattedMessage id="publisher.classification.construction"/>, value: 621},
	{label: <FormattedMessage id="publisher.classification.transport"/>, value: 622},
	{label: <FormattedMessage id="publisher.classification.information-tech"/>, value: 630},
	{label: <FormattedMessage id="publisher.classification.medicine"/>, value: 640},
	{label: <FormattedMessage id="publisher.classification.odontology"/>, value: 650},
	{label: <FormattedMessage id="publisher.classification.veteriniry"/>, value: 660},
	{label: <FormattedMessage id="publisher.classification.pharmacology"/>, value: 670},
	{label: <FormattedMessage id="publisher.classification.forestry"/>, value: 672},
	{label: <FormattedMessage id="publisher.classification.agriculture"/>, value: 680},
	{label: <FormattedMessage id="publisher.classification.handicraft"/>, value: 690},
	{label: <FormattedMessage id="publisher.classification.art"/>, value: 700},
	{label: <FormattedMessage id="publisher.classification.performing-art"/>, value: 710},
	{label: <FormattedMessage id="publisher.classification.theatre"/>, value: 720},
	{label: <FormattedMessage id="publisher.classification.dance"/>, value: 730},
	{label: <FormattedMessage id="publisher.classification.visual-art"/>, value: 740},
	{label: <FormattedMessage id="publisher.classification.art-history"/>, value: 750},
	{label: <FormattedMessage id="publisher.classification.architecture"/>, value: 760},
	{label: <FormattedMessage id="publisher.classification.fashion"/>, value: 765},
	{label: <FormattedMessage id="publisher.classification.music"/>, value: 770},
	{label: <FormattedMessage id="publisher.classification.antique"/>, value: 780},
	{label: <FormattedMessage id="publisher.classification.city-regional"/>, value: 790},
	{label: <FormattedMessage id="publisher.classification.leisure-hobbies"/>, value: 800},
	{label: <FormattedMessage id="publisher.classification.sports"/>, value: 810},
	{label: <FormattedMessage id="publisher.classification.games"/>, value: 820},
	{label: <FormattedMessage id="publisher.classification.hunting-fishing"/>, value: 830},
	{label: <FormattedMessage id="publisher.classification.gardening"/>, value: 840},
	{label: <FormattedMessage id="publisher.classification.home-economic"/>, value: 850},
	{label: <FormattedMessage id="publisher.classification.health-beauty"/>, value: 860},
	{label: <FormattedMessage id="publisher.classification.photography"/>, value: 870},
	{label: <FormattedMessage id="publisher.classification.tourism"/>, value: 880},
	{label: <FormattedMessage id="publisher.classification.humour"/>, value: 890},
	{label: <FormattedMessage id="publisher.classification.history"/>, value: 900},
	{label: <FormattedMessage id="publisher.classification.geography"/>, value: 910},
	{label: <FormattedMessage id="publisher.classification.map-atlases"/>, value: 920},
	{label: <FormattedMessage id="publisher.classification.archeology"/>, value: 930},
	{label: <FormattedMessage id="publisher.classification.genealogy"/>, value: 940},
	{label: <FormattedMessage id="publisher.classification.numismatics"/>, value: 950}
];

export const isbnClassificationCodes = [
	{label: <FormattedMessage id="publicationRegistration.form.basicInformation.classification.nonFiction"/>, value: 1},
	{label: <FormattedMessage id="publicationRegistration.form.basicInformation.classification.fiction"/>, value: 2},
	{label: <FormattedMessage id="publicationRegistration.form.basicInformation.classification.cartoon"/>, value: 3},
	{label: <FormattedMessage id="publicationRegistration.form.basicInformation.classification.childrenBook"/>, value: 4}
];

export const publisherCategory = [
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.privatePerson"/>, value: 'private person'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.associationCorporationOrganisation"/>, value: 'association/corporation/organisation/foundation'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.cityMunicipality"/>, value: 'city/municipality'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.school"/>, value: 'school'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.churchOrcongregation"/>, value: 'church or congregation'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.governmentInstitution"/>, value: 'government institution'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.otherOrganization"/>, value: 'other organization'},
	{label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory.other"/>, value: 'other'}
];

export const fieldArray = [
	{
		[PAGES.BASIC_INFORMATION]: [
			{
				name: 'name',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.name"/>,
				width: 'half'
			},
			{
				name: 'aliases',
				type: 'textArea',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.aliases"/>,
				width: 'half'
			},
			{
				name: 'earlierName',
				type: 'textArea',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.earlierName"/>,
				width: 'half'
			},
			{
				name: 'postalAddress[address]',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.postalAddress"/>,
				width: 'half'
			},
			{
				name: 'postalAddress[zip]',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.postalZip"/>,
				width: 'half'
			},
			{
				name: 'postalAddress[city]',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.postalCity"/>,
				width: 'half'
			},
			{
				name: 'phone',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.phone"/>,
				width: 'half'
			},
			{
				name: 'publisherCategory',
				type: 'multiSelect',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.publisherCategory"/>,
				width: 'half',
				options: publisherCategory,
				isMulti: false
			},
			{
				name: 'contactPerson',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.contactPerson"/>,
				width: 'half'
			},
			{
				name: 'email',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.email"/>,
				width: 'half'
			},
			{
				name: 'website',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.basicInformation.website"/>,
				width: 'half'
			}
		]
	},
	{
		[PAGES.PUBLISHING_ACTIVITIES]: [
			{
				name: 'publicationDetails[frequency][currentYear]',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.frequency.currentYear"/>,
				width: 'half'
			},
			{
				name: 'publicationDetails[frequency][nextYear]',
				type: 'text',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.frequency.nextYear"/>,
				width: 'half'
			},
			{
				name: 'classification',
				type: 'multiSelect',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.classification"/>,
				options: classificationCodes,
				width: 'half',
				instructions: getClassificationInstruction(),
				isMulti: true
			}
		]
	},
	{
		[PAGES.ORGANIZATION_DETAILS]: [
			{
				name: 'organizationDetails[affiliate]',
				type: 'textArea',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.organization.affiliate"/>,
				width: 'half'
			},
			{
				name: 'organizationDetails[distributor]',
				type: 'textArea',
				label: <FormattedMessage id="publisherRegistration.form.publishingActivities.organization.distributor"/>,
				width: 'half'
			}
		]
	},
	{
		[PAGES.REVIEW]: 'review'
	}
];

function getClassificationInstruction() {
	return (
		<>
			<Typography>
				<FormattedMessage id="publisherRegistration.form.classificationInstruction1"/>
			</Typography>
			<Typography>
				<FormattedMessage id="publisherRegistration.form.classificationInstruction2"/>
			</Typography>
		</>
	);
}
