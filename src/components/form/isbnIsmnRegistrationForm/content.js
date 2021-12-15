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

import moment from 'moment';

import {getMultipleAndCreatableSelectInstruction, getMultipleSelectInstruction} from '../commons';
import {PAGES} from './constants';
import {FORMATS, PUBLICATION_TYPES} from '../constants';

export function getFormPages(intl) {
	return {
		[PAGES.AVAILABILITY_INFORMATION]: {
			renderType: 'element',
			fields: [
				{
					name: 'isPublic',
					type: 'select',
					title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.isPubic.label'}),
					defaultValue: 'false',
					options: [
						{label: '', value: ''},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.note.option.yes'}), value: 'true'},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.note.option.no'}), value: 'false'}
					]
				},
				{
					name: 'publicationType',
					type: 'select',
					title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.label'}),
					options: [
						{label: '', value: ''},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.book'}), value: PUBLICATION_TYPES.BOOK},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.dissertation'}), value: PUBLICATION_TYPES.DISSERTATION},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.music'}), value: PUBLICATION_TYPES.MUSIC},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.map'}), value: PUBLICATION_TYPES.MAP},
						{label: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.other'}), value: PUBLICATION_TYPES.OTHER}
					]
				}
			]},
		[PAGES.PUBLISHER_INFORMATION]: {
			renderType: 'element',
			fields: [
				{
					name: 'name',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.name'}),
					width: 'half'
				},
				{
					name: 'code',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.code'}),
					width: 'half'
				},
				{
					name: 'postalAddress[address]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.address'}),
					width: 'half'
				},
				{
					name: 'postalAddress[zip]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.zip'}),
					width: 'half'
				},
				{
					name: 'postalAddress[city]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.city'}),
					width: 'half'
				},
				{
					name: 'phone',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.phone'}),
					width: 'half'
				},
				{
					name: 'contactPerson',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.contactPerson'}),
					width: 'half'
				},
				{
					name: 'email',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publisherBasicInfo.email'}),
					width: 'half'
				}
			]},
		[PAGES.PUBLISHING_ACTIVITIES]: {
			renderType: 'element',
			fields: [
				{
					name: 'publicationDetails[currentYearFrequency]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.thisYear'}),
					width: 'half'
				},
				{
					name: 'publicationDetails[nextYearFrequency]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.nextYear'}),
					width: 'half'
				},
				{
					name: 'publicationDetails[previouslyPublished]',
					type: 'select',
					label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.previouslyPublished'}),
					width: 'half',
					options: [
						{label: '', value: ''},
						{label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.previouslyPublished.yes'}), value: 'true'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.previouslyPublished.no'}), value: 'false'}
					]
				},
				{
					name: 'publicationDetails[publishingActivities]',
					type: 'select',
					label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.occasionalOrContinuous'}),
					width: 'half',
					options: [
						{label: '', value: ''},
						{label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.occasional'}), value: 'occasional'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.continuous'}), value: 'continuous'}
					]
				}
			]},
		[PAGES.CONTACT_INFORMATION]: {
			renderType: 'element',
			fields: [
				{
					name: 'contactPerson',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.contactPerson'}),
					width: 'half'
				},
				{
					name: 'address',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.address'}),
					width: 'half'
				},
				{
					name: 'zip',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.zip'}),
					width: 'half'
				},
				{
					name: 'city',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.city'}),
					width: 'half'
				},
				{
					name: 'country',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.country'}),
					width: 'half'
				},
				{
					name: 'phone',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.phone'}),
					width: 'half'
				},
				{
					name: 'email',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.contactInfo.email'}),
					width: 'half'
				}
			]},
		[PAGES.UNIVERSITY_INFORMATION]: {
			renderType: 'element',
			fields: [
				{
					name: 'university[name]',
					label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.universityName'}),
					type: 'text',
					width: 'half'
				},
				{
					name: 'university[city]',
					label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.city'}),
					type: 'text',
					width: 'half'
				}
				/* Disabled until search is properly implemented
				{
					name: 'insertUniversity',
					type: 'checkbox',
					label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.insertUniversity.checkbox.label'}),
					width: 'half',
					info: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.insertUniversity.checkbox.info'})
				}
				*/
			]},
		[PAGES.BASIC_INFORMATION]: {
			renderType: 'element',
			fields: [
				{
					name: 'title',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.title'}),
					width: 'half'
				},
				{
					name: 'subtitle',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.subtitle'}),
					width: 'half'
				},
				{
					name: 'language',
					type: 'select',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.language.title'}),
					width: 'half',
					defaultValue: 'fin',
					options: [
						{label: 'Suomi', value: 'fin'},
						{label: 'Svenska', value: 'swe'},
						{label: 'English ', value: 'eng'},
						{label: 'Sami', value: 'smi'},
						{label: 'French', value: 'fre'},
						{label: 'Germany', value: 'ger'},
						{label: 'Russain', value: 'rus'},
						{label: 'Spanish', value: 'esp'},
						{label: 'Other', value: 'other'},
						{label: 'Bilingual', value: 'bilingual'}
					]
				},
				{
					name: 'mapDetails[scale]',
					label: intl.formatMessage({id: 'publicationRegistration.form.map.scale'}),
					type: 'text',
					width: 'half'
				},
				{
					name: 'publicationTime',
					type: 'dateTime',
					width: 'half',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.publicationTime'}),
					min: moment(Date.now()).format('YYYY-MM'),
					pattern: '[0-9]{4}-[0-9]{2}',
					formName: 'isbnIsmnRegForm'
				}
				/* Disabled for now
				{
					name: 'isbnClassification',
					type: 'multiSelect',
					width: 'half',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.classification.label'}),
					isMulti: true,
					instructions: getMultipleAndCreatableSelectInstruction(),
					isCreatable: false,
					options: [
						{label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.classification.nonFiction'}), value: 1},
						{label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.classification.fiction'}), value: 2},
						{label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.classification.cartoon'}), value: 3},
						{label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.classification.childrenBook'}), value: 4}
					]
				}
				*/
			]},
		[PAGES.AUTHOR_INFORMATION]: {
			renderType: 'fieldArray',
			name: 'authors',
			fields: [
				{
					name: 'authorGivenName',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.authors.authorGivenName'}),
					width: 'half'
				},
				{
					name: 'authorFamilyName',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.authors.authorFamilyName'}),
					width: 'half'
				},
				{
					name: 'role',
					type: 'multiSelect',
					isMulti: true,
					isCreatable: false,
					instructions: getMultipleAndCreatableSelectInstruction(),
					label: intl.formatMessage({id: 'publicationRegistration.form.authors.role'}),
					width: 'half',
					options: [
						{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.author'}), value: 'tekijä'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.illustrator'}), value: 'kuvittaja'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.translator'}), value: 'kääntäjä'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.editor'}), value: 'toimittaja'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.reader'}), value: 'lukija'}
					]
				}
			]},
		[PAGES.SERIES_INFORMATION]: {
			renderType: 'element',
			fields: [
				{
					name: 'seriesDetails[seriesTitle]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.series.title'}),
					width: 'half'
				},
				{
					name: 'seriesDetails[identifier]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.series.identifier'}),
					width: 'half'
				},
				{
					name: 'seriesDetails[volume]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.series.volume'}),
					width: 'half'
				}
			]},
		[PAGES.FORMAT]: {
			renderType: 'element',
			fields: [
				{
					name: 'selectFormat',
					type: 'select',
					width: 'half',
					label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.select.label'}),
					options: [
						{label: '', value: ''},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed'}), value: FORMATS.PRINT},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.electronic'}), value: FORMATS.ELECTRONIC},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.both'}), value: FORMATS.BOTH}
					]
				}
			],
			additionalFields: [
				{
					format: FORMATS.ELECTRONIC,
					fields: [
						{
							isMulti: true,
							isCreatable: false,
							label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.fileformat'}),
							name: 'formatDetails[fileFormat]',
							type: 'multiSelect',
							instructions: getMultipleSelectInstruction(),
							width: 'half',
							options: [
								{label: 'Pdf', value: 'pdf'},
								{label: 'Epub', value: 'epub'},
								{label: 'CD', value: 'cd'},
								{label: 'MP3', value: 'mp3'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.other'}), value: 'other'}
							]
						},
						{
							label: intl.formatMessage({id: 'publicationRegistration.form.isbnismn.formatDetails.electronic.other'}),
							name: 'formatDetails[additionalElectronicDetails]',
							type: 'text',
							width: 'half'
						}
					]},
				{
					format: FORMATS.PRINT,
					fields: [
						{
							isMulti: true,
							isCreatable: false,
							label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printformat'}),
							name: 'formatDetails[printFormat]',
							type: 'multiSelect',
							instructions: getMultipleSelectInstruction(),
							width: 'half',
							options: [
								{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.printformat.paperback'}), value: 'paperback'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.printformat.hardback'}), value: 'hardback'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.printformat.spiral-binding'}), value: 'spiral-binding'}
							]
						},
						{
							label: intl.formatMessage({id: 'publicationRegistration.form.isbnismn.formatDetails.printed.other'}),
							name: 'formatDetails[additionalPrintDetails]',
							type: 'text',
							width: 'half'
						},
						{
							label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.manufacturer'}),
							name: 'formatDetails[manufacturer]',
							type: 'text',
							width: 'half'
						},
						{
							label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.city'}),
							name: 'formatDetails[city]',
							type: 'text',
							width: 'half'
						},
						{
							label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.run'}),
							name: 'formatDetails[run]',
							type: 'numeric',
							width: 'half'
						},
						{
							label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed.edition'}),
							name: 'formatDetails[edition]',
							type: 'text',
							width: 'half'
						}
					]}
			]
		},
		[PAGES.ADDITIONAL_DETAILS]: {
			renderType: 'element',
			fields: [
				{
					name: 'additionalDetails',
					type: 'textArea',
					label: intl.formatMessage({id: 'publicationRegistration.form.additionalDetails'}),
					width: 'half'
				}
			]}
	};
}
