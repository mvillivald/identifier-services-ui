import moment from 'moment';

export function formatPublicationValues(values, isAuthenticated, user) {
	const dissertPublisher = !isAuthenticated && (values.publicationType === 'dissertation' ?
		{
			contactPerson: values.contactPerson,
			address: values.address,
			zip: values.zip,
			city: values.city,
			country: values.country,
			phone: values.phone,
			email: values.email,
			university: values.selectUniversity ? {name: values.selectUniversity.title, city: values.selectUniversity.place} :
				{name: values.university.name, city: values.university.city}
		} :
		{
			name: values.name,
			contactPerson: values.contactPerson,
			postalAddress: values.postalAddress,
			email: values.email,
			phone: values.phone && values.phone,
			language: values.publisherLanguage,
			code: values.code && values.code,
			publicationDetails: {
				...values.publicationDetails,
				previouslyPublished: Boolean(values.publicationDetails.previouslyPublished),
				frequency: {
					currentYear: Number(values.publicationDetails.currentYearFrequency),
					nextYear: Number(values.publicationDetails.nextYearFrequency)
				}
			}
		});
	const publisher = isAuthenticated ? user.publisher : dissertPublisher;
	const formatAuthors = values.authors.map(item => Object.keys(item).reduce((acc, key) => {
		if (key === 'role') {
			return {...acc, [replaceKey(key)]: item[key].map(i => i.value)};
		}

		return {...acc, [replaceKey(key)]: item[key]};
	}, {}));

	function formatTitle() {
		const {seriesTitle, ...formatTitle} = values.seriesDetails && {
			...values.seriesDetails,
			volume: values.seriesDetails.volume && values.seriesDetails.volume,
			title: values.seriesDetails.seriesTitle && values.seriesDetails.seriesTitle
		};
		return formatTitle;
	}

	const map = values.mapDetails ? values.mapDetails : undefined;
	const {
		select,
		selectFormat,
		name,
		postalAddress,
		email,
		phone,
		publisherLanguage,
		code,
		publicationDetails,
		insertUniversity,
		university,
		place,
		contactPerson,
		address,
		zip,
		city,
		country,
		...formattedPublicationValue
	} = {
		...values,
		publisher,
		authors: formatAuthors,
		seriesDetails: values.seriesDetails && formatTitle(),
		formatDetails: formatDetail(),
		type: values.publicationType,
		publicationTime: moment(values.publicationTime.toLocaleString()).toISOString(),
		isPublic: user.role !== 'publisher' && values.isPublic.value,
		isbnClassification: values.isbnClassification ? values.isbnClassification.map(item => item.value.toString()) : undefined,
		mapDetails: values.publicationType === 'map' ? map : undefined
	};

	return formattedPublicationValue;

	function formatDetail() {
		const formatDetails = {
			...values.formatDetails
		};
		if (values.selectFormat === 'electronic') {
			if (values.formatDetails.fileFormat) {
				return {
					...formatDetails,
					format: 'electronic',
					fileFormat: {format: reFormat(values.formatDetails.fileFormat)}
				};
			}

			return {
				...formatDetails,
				format: 'electronic'
			};
		}

		if (values.selectFormat === 'printed') {
			if (values.formatDetails.printFormat) {
				return {
					format: 'printed',
					printFormat: {format: reFormat(values.formatDetails.printFormat)}
				};
			}

			return {
				...formatDetails,
				format: 'printed'
			};
		}

		if (values.selectFormat === 'both') {
			if (values.formatDetails.printFormat && values.formatDetails.fileFormat) {
				return {
					...formatDetails,
					format: 'printed-and-electronic',
					printFormat: {format: reFormat(values.formatDetails.printFormat)},
					fileFormat: {format: reFormat(values.formatDetails.fileFormat)}
				};
			}

			if (values.formatDetails.fileFormat) {
				return {
					...formatDetails,
					format: 'printed-and-electronic',
					fileFormat: {format: reFormat(values.formatDetails.fileFormat)}
				};
			}

			if (values.formatDetails.printFormat) {
				return {
					...formatDetails,
					format: 'printed-and-electronic',
					printFormat: {format: reFormat(values.formatDetails.printFormat)}
				};
			}

			return {
				...formatDetails,
				format: 'printed-and-electronic'
			};
		}

		return formatDetails;
	}

	function reFormat(value) {
		return value.reduce((acc, item) => { // eslint-disable-line array-callback-return
			if (item.label !== '') {
				acc.push(item.value);
				return acc;
			}
		}, []);
	}

	function replaceKey(key) {
		switch (key) {
			case 'role':
				return 'role';
			case 'authorGivenName':
				return 'givenName';
			case 'authorFamilyName':
				return 'familyName';
			default:
				return null;
		}
	}
}
