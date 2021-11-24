/* eslint-disable complexity */
export function validate(values) {
	const errors = {
		publicationDetails: {frequency: {}},
		previousPublication: {},
		postalAddress: {},
		formatDetails: {},
		university: {}
	};
	const {
		publicationDetails = {},
		previousPublication = {},
		postalAddress = {},
		formatDetails = {},
		university = {},
		frequency = {},
		issnFormatDetails = [],
		type = {}
	} = values;

	const requiredFields = [
		'name',
		'contactPerson',
		'publisherEmail',
		'title',
		'publicationTime',
		'authorGivenName',
		'authorFamilyName',
		'role',
		'selectFormat',
		'publisherType',
		'firstName',
		'lastName',
		'address',
		'postCode',
		'city',
		'country',
		'contactEmail',
		'firstNumber',
		'firstYear',
		'prefix',
		'langGroup',
		'category',
		'rangeStart',
		'rangeEnd',
		'phone'
	];

	requiredFields.forEach(field => {
		if (!values[field]) {
			errors[field] = 'field.required';
		}
	});

	if (values.langGroup) {
		if (!/^\d{3}$/.test(values.langGroup)) {
			errors.langGroup = 'Invalid Value';
		}
	}

	if (values.rangeStart) {
		if (!/^\d{1,7}$/.test(values.rangeStart)) {
			errors.rangeStart = 'Invalid Value';
		}
	}

	if (values.rangeEnd) {
		if (!/^\d{1,7}$/.test(values.rangeEnd)) {
			errors.rangeEnd = 'Invalid Value';
		}
	}

	if (values.firstNumber) {
		if (/"/.test(values.firstNumber)) {
			errors.firstNumber = 'Invalid Value';
		}
	}

	if (!values.selectUniversity) {
		errors.selectUniversity = 'field.required';
	}

	if (!university.name) {
		errors.university.name = 'field.required';
	}

	if (!university.city) {
		errors.university.city = 'field.required';
	}

	if (!values.contactEmail) {
		errors.contactEmail = 'field.required';
	} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.contactEmail)) {
		errors.contactEmail = 'format.email';
	}

	if (!formatDetails.format) {
		errors.formatDetails.format = 'field.required';
	} else if (formatDetails.format.value === '') {
		errors.formatDetails.format = 'field.required';
	}

	if (!formatDetails.fileFormat) {
		if (!formatDetails.otherFileFormat) {
			errors.formatDetails.fileFormat = 'field.required';
		}
	} else if (formatDetails.fileFormat.value === '') {
		if (!formatDetails.otherFileFormat) {
			errors.formatDetails.fileFormat = 'field.required';
		}
	}

	if (!formatDetails.printFormat) {
		if (!formatDetails.otherPrintFormat) {
			errors.formatDetails.printFormat = 'field.required';
		}
	} else if (formatDetails.printFormat.value === '') {
		if (!formatDetails.otherPrintFormat) {
			errors.formatDetails.printFormat = 'field.required';
		}
	}

	if (formatDetails.run && !/^[0-9]*$/gm.test(formatDetails.run)) {
		errors.formatDetails.run = 'Must be a number [0-9]';
	}

	if (!publicationDetails.currentYearFrequency) {
		errors.publicationDetails.currentYearFrequency = 'field.required';
	} else if (!/^([0-9]|([MDCLXVI]))*$/gm.test(publicationDetails.currentYearFrequency)) {
		errors.publicationDetails.currentYearFrequency = 'format.integer';
	}

	if (!publicationDetails.nextYearFrequency) {
		errors.publicationDetails.nextYearFrequency = 'field.required';
	} else if (!/^([0-9]|([MDCLXVI]))*$/gm.test(publicationDetails.nextYearFrequency)) {
		errors.publicationDetails.nextYearFrequency = 'format.integer';
	}

	if (previousPublication.lastYear && !/^([0-9]|([MDCLXVI]))*$/gm.test(previousPublication.lastYear)) {
		errors.previousPublication.lastYear = 'format.integer';
	}

	if (previousPublication.lastNumber && !/^([0-9]|([MDCLXVI]))*$/gm.test(previousPublication.lastNumber)) {
		errors.previousPublication.lastNumber = 'format.integer';
	}

	if (!publicationDetails.previouslyPublished) {
		errors.publicationDetails.previouslyPublished = 'field.required';
	}

	if (!publicationDetails.publishingActivities) {
		errors.publicationDetails.publishingActivities = 'field.required';
	}

	if (isNaN(Date.parse(values.publicationTime))) {
		errors.publicationTime = 'format.date';
	}

	if (!postalAddress.address) {
		errors.postalAddress.address = 'field.required';
	}

	if (!postalAddress.city) {
		errors.postalAddress.city = 'field.required';
	}

	if (!postalAddress.zip) {
		errors.postalAddress.zip = 'field.required';
	}

	if (postalAddress.zip && !/^\d+$/.test(postalAddress.zip)) {
		errors.postalAddress.zip = 'postalAddress.zip.format';
	}

	if (postalAddress.city && !/^[a-zA-Z\s]+$/.test(postalAddress.city)) {
		errors.postalAddress.city = 'postalAddress.city.format';
	}

	if (values.phone && !/^[0-9-+]+/.test(values.phone)) {
		errors.phone = 'format.phone';
	}

	if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.publisherEmail)) {
		errors.publisherEmail = 'format.email';
	}

	if (values.primaryContact && values.primaryContact.length > 0) {// Empty
	} else {
		validateContact();
		errors.primaryContact = {
			_error: 'At least one member must be enter'
		};
	}

	function validateContact() {
		if (!values.email) {
			errors.email = 'field.required';
		} else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
			errors.email = 'format.email';
		}
	}

	if (!/\w{2,}/i.test(values.streetAddress)) {
		errors.streetAddress = 'format.length';
	}

	if (!/\w{2,}/i.test(values.city)) {
		errors.city = 'format.length';
	}

	if (!/^\d{3,}$/i.test(values.zip)) {
		errors.zip = 'format.integer';
	}

	if (values.authors && values.authors.length > 0) { // Empty
		delete errors.authorGivenName;
		delete errors.authorFamilyName;
		delete errors.role;
	} else {
		validateAuthor();
		errors.authors = {
			_error: 'At least one member must be enter'
		};
	}

	function validateAuthor() {
		if (!values.authorGivenName) {
			errors.authorGivenName = 'field.required';
		} else if (!values.authorFamilyName) {
			errors.authorFamilyName = 'field.required';
		} else if (!values.role) {
			errors.role = 'field.required';
		}
	}

	if (values.emails && values.emails.length > 0) {
		return;
	}

	errors.emails = {
		_error: 'At least one email must be enter'
	};

	if (!values.classification) {
		errors.classification = 'field.required';
	}

	if (!values._id && !frequency.value) {
		errors.frequency = 'field.required';
	}

	if (!values._id && !type.value) {
		errors.type = 'field.required';
	}

	if (issnFormatDetails === null || issnFormatDetails.length === 0) {
		errors.issnFormatDetails = 'field.required';
	} else if (issnFormatDetails.length > 0) {
		if (issnFormatDetails.some(item => item.value === 'online') && !formatDetails.url) {
			errors.formatDetails.url = 'field.required';
		}
	}

	if (!values.isPublic || String(values.isPublic).toLowerCase() !== 'true') {
		errors.isPublic = 'publicationRegistrationIsbnIsmn.form.availability';
	}

	if (!values.publicationType) {
		errors.publicationType = 'field.required';
	}

	return errors;
}
