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

import {FORMATS, PUBLICATION_TYPES} from '../constants';
import {removeFields} from '../utils';
import {PAGES} from './constants';

export function filterFormFields(formPages, publicationValues) {
	let pages = formPages;

	// Genre classification is used only for books
	if (!publicationIsType(publicationValues, [PUBLICATION_TYPES.BOOK])) {
		pages = removeFields(pages, ['isbnClassification']);
	}

	// Map scale field is used only for maps
	if (!publicationIsType(publicationValues, [PUBLICATION_TYPES.MAP])) {
		pages = removeFields(pages, ['mapDetails[scale]']);
	}

	// Format detail fields are added based on format type
	const format = getFormat(publicationValues);
	if (format) {
		addFormatFields(pages, format);
	}

	return pages;

	function addFormatFields(pages, format) {
		const additionalFields = format === 'both' ?
			pages[PAGES.FORMAT].additionalFields.map(aFields => aFields.fields).flat() :
			pages[PAGES.FORMAT].additionalFields.find(f => f.format === format).fields;

		pages[PAGES.FORMAT].fields = pages[PAGES.FORMAT].fields.concat(additionalFields);
	}
}

export function getSteps(isAuthenticated, publicationValues) {
	// Required information depends upon:
	//  - Whether user is authenticated
	//  - Whether publication is type of dissertation

	let pages = [
		PAGES.AVAILABILITY_INFORMATION,
		PAGES.BASIC_INFORMATION,
		PAGES.AUTHOR_INFORMATION,
		PAGES.SERIES_INFORMATION,
		PAGES.FORMAT,
		PAGES.ADDITIONAL_DETAILS
	];

	if (!isAuthenticated) {
		if (publicationIsType(publicationValues, ['dissertation'])) {
			pages.splice(1, 0, PAGES.UNIVERSITY_INFORMATION);
			pages.splice(2, 0, PAGES.CONTACT_INFORMATION);
		} else {
			pages.splice(1, 0, PAGES.PUBLISHER_INFORMATION);
			pages.splice(2, 0, PAGES.PUBLISHING_ACTIVITIES);
		}
	}

	return pages;
}

function publicationIsType(publicationValues, typeList) {
	return publicationValues && publicationValues.publicationType && typeList.some(t => publicationValues.publicationType === t);
}

function getFormat(publicationValues) {
	if (publicationValues && publicationValues.selectFormat) {
		const idx = Object.values(FORMATS).indexOf(publicationValues.selectFormat);
		return idx === -1 ? false : publicationValues.selectFormat;
	}
}

