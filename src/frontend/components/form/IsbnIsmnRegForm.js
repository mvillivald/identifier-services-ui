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

import React, {useState, useEffect} from 'react';
import {reduxForm, getFormValues, Field} from 'redux-form';
import {validate} from '@natlibfi/identifier-services-commons';
import {Button, Grid, Stepper, Step, StepLabel, Typography, Checkbox, FormControlLabel} from '@material-ui/core';
import {connect} from 'react-redux';
import {useCookies} from 'react-cookie';
import {FormattedMessage, useIntl} from 'react-intl';
import HttpStatus from 'http-status';
import moment from 'moment';
import PopoverComponent from '../PopoverComponent';
import HelpIcon from '@material-ui/icons/Help';

import * as actions from '../../store/actions';
import useStyles from '../../styles/form';
import ResetCaptchaButton from './ResetCaptchaButton';
import Captcha from '../Captcha';
import {element, fieldArrayElement, getMultipleAndCreatableSelectInstruction, formatLanguage} from './commons';
import ListComponent from '../ListComponent';
import renderSelectAutoComplete from './render/renderSelectAutoComplete';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'isbnIsmnRegForm',
	validate
})(
	props => {
		const {
			loadSvgCaptcha,
			captcha,
			pristine,
			valid,
			postCaptchaInput,
			publicationValues,
			clearFields,
			user,
			isAuthenticated,
			publicationCreation,
			publicationCreationRequest,
			getUniversityPublisher,
			universityPublisher,
			setMessage,
			handleSubmit,
			history,
			location,
			lang
		} = props;
		const {prevPath} = location.state !== undefined && location.state;
		const intl = useIntl();
		const fieldArray = getFieldArray(intl);
		const dissFieldArray = getDissertationFieldArray(intl);
		const classes = useStyles();
		const [activeStep, setActiveStep] = useState(0);
		const [captchaInput, setCaptchaInput] = useState('');
		const [typeSelect, setTypeSelect] = useState(true);
		const [isbnFromUniversity, setIsbnFromUniversity] = useState(false);
		/* global COOKIE_NAME */
		const [cookie] = useCookies(COOKIE_NAME);

		fieldArray[3].basicInformation.push({
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
		});

		if (publicationValues && publicationValues.type && (publicationValues.type.value === 'dissertation' || publicationValues.type.value === 'music' || publicationValues.type.value === 'map')) {
			fieldArray[3].basicInformation.splice(4, 1);
		}

		if (publicationValues && publicationValues.type && publicationValues.type.value === 'map') {
			fieldArray[3].basicInformation.push({
				label: intl.formatMessage({id: 'publicationRegistration.form.map.scale'}),
				name: 'mapDetails[scale]',
				type: 'text',
				width: 'half'
			});
		}

		const steps = getSteps(fieldArray, dissFieldArray);

		useEffect(() => {
			if (!isAuthenticated) {
				loadSvgCaptcha();
				getUniversityPublisher();
			}
		}, [getUniversityPublisher, isAuthenticated, loadSvgCaptcha]);

		function getStepContent(step) {
			if (isAuthenticated) {
				if (user.role !== undefined && user.role === 'publisher') {
					switch (step) {
						case 0:
							return element({array: fieldArray[3].basicInformation, classes, clearFields, publicationIsbnValues: publicationValues});
						case 1:
							return withFormTitle({arr: fieldArray[4].Authors, publicationValues, clearFields, formName: 'isbnIsmnRegForm'});
						case 2:
							return withFormTitle({arr: fieldArray[5].Series, publicationValues, clearFields});
						case 3:
							return element({array: fieldArray[6].formatDetails, fieldName: 'formatDetails', publicationIsbnValues: publicationValues, classes, clearFields, intl});
						case 4:
							return renderPreview(publicationValues);
						default:
							return 'Unknown step';
					}
				} else {
					switch (step) {
						case 0:
							return element({array: fieldArray[3].basicInformation, classes, clearFields, publicationIsbnValues: publicationValues});
						case 1:
							return withFormTitle({arr: fieldArray[4].Authors, publicationValues, clearFields, formName: 'isbnIsmnRegForm'});
						case 2:
							return withFormTitle({arr: fieldArray[5].Series, publicationValues, clearFields});
						case 3:
							return element({array: fieldArray[6].formatDetails, fieldName: 'formatDetails', publicationIsbnValues: publicationValues, classes, clearFields, intl});
						case 4:
							return renderAdditionalInformation();
						case 5:
							return renderPreview(publicationValues);
						default:
							return 'Unknown step';
					}
				}
			}

			if (!isAuthenticated && publicationValues.type.value !== 'dissertation') {
				switch (step) {
					case 0:
						return element({array: fieldArray[0].publisherBasicInfo, classes, clearFields});
					case 1:
						return element({array: fieldArray[1].publishingActivities, classes, clearFields});
					case 2:
						return element({array: fieldArray[3].basicInformation, classes, clearFields, publicationIsbnValues: publicationValues});
					case 3:
						return withFormTitle({arr: fieldArray[4].Authors, publicationValues, clearFields, formName: 'isbnIsmnRegForm'});
					case 4:
						return withFormTitle({arr: fieldArray[5].Series, publicationValues, clearFields});
					case 5:
						return element({array: fieldArray[6].formatDetails, fieldName: 'formatDetails', publicationIsbnValues: publicationValues, classes, clearFields, intl});
					case 6:
						return renderAdditionalInformation();
					case 7:
						return renderPreview(publicationValues);
					default:
						return 'Unknown step';
				}
			}

			if (!isAuthenticated && publicationValues.type.value === 'dissertation') {
				switch (step) {
					case 0:
						return (universityPublisher.length === 0 || publicationValues.insertUniversity) ?
							<>{element({array: dissertCheckBox(), classes})}{element({array: dissFieldArray[0].UniversityInfo, classes})}</> :
							<>{element({array: searchPublisherComponent(), classes})}{element({array: dissertCheckBox(), classes})}</>;
					case 1:
						return element({array: fieldArray[2].contactInfo, classes});
					case 2:
						return element({array: fieldArray[3].basicInformation, classes, clearFields, publicationIsbnValues: publicationValues});
					case 3:
						return withFormTitle({arr: fieldArray[4].Authors, publicationValues, clearFields, formName: 'isbnIsmnRegForm'});
					case 4:
						return withFormTitle({arr: fieldArray[5].Series, publicationValues, clearFields});
					case 5:
						return element({array: fieldArray[6].formatDetails, fieldName: 'formatDetails', publicationIsbnValues: publicationValues, classes, clearFields, intl});
					case 6:
						return renderAdditionalInformation();
					case 7:
						return renderPreview(publicationValues);
					default:
						return 'Unknown step';
				}
			}
		}

		const handleContinueClick = () => {
			setTypeSelect(!typeSelect);
		};

		const handleCaptchaInput = e => {
			setCaptchaInput(e.target.value);
		};

		function handleNext() {
			setActiveStep(activeStep + 1);
		}

		function handleBack() {
			if (activeStep === 0 || (isAuthenticated && activeStep === 5)) {
				setTypeSelect(!typeSelect);
			} else {
				setActiveStep(activeStep - 1);
			}
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

		async function handlePublicationRegistration(values) {
			if (isAuthenticated) {
				const result = await publicationCreation({values: formatPublicationValues(values), token: cookie[COOKIE_NAME], subType: 'isbn-ismn', lang: lang});
				if (result === HttpStatus.CREATED) {
					if (prevPath) {
						history.push(prevPath);
					}

					history.push('/');
				}
			} else if (captchaInput.length === 0) {
				setMessage({color: 'error', msg: intl.formatMessage({id: 'captcha.notprovided'})});
			} else if (captchaInput.length > 0) {
				const result = await postCaptchaInput(captchaInput, captcha.id);
				submitPublication(formatPublicationValues(values), result);
			}
		}

		function formatPublicationValues(values) {
			const dissertPublisher = !isAuthenticated && (publicationValues.type.value === 'dissertation' ?
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
							currentYear: Number(values.publicationDetails.frequency.currentYear),
							nextYear: Number(values.publicationDetails.frequency.nextYear)
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
				type: values.type.value,
				publicationTime: moment(values.publicationTime.toLocaleString()).toISOString(),
				isPublic: user.role !== 'publisher' && values.isPublic.value,
				isbnClassification: values.isbnClassification ? values.isbnClassification.map(item => item.value.toString()) : undefined,
				mapDetails: publicationValues.type.value === 'map' ? map : undefined
			};

			return formattedPublicationValue;

			function formatDetail() {
				const formatDetails = {
					...values.formatDetails,
					run: values.formatDetails.run && Number(values.formatDetails.run)
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
							format: 'printed and electronic',
							printFormat: {format: reFormat(values.formatDetails.printFormat)},
							fileFormat: {format: reFormat(values.formatDetails.fileFormat)}
						};
					}

					if (values.formatDetails.fileFormat) {
						return {
							...formatDetails,
							format: 'printed and electronic',
							fileFormat: {format: reFormat(values.formatDetails.fileFormat)}
						};
					}

					if (values.formatDetails.printFormat) {
						return {
							...formatDetails,
							format: 'printed and electronic',
							printFormat: {format: reFormat(values.formatDetails.printFormat)}
						};
					}

					return {
						...formatDetails,
						format: 'printed and electronic'
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
		}

		async function submitPublication(values, result) {
			if (result === true) {
				const result = await publicationCreationRequest({values: values, subType: 'isbn-ismn', lang: lang});
				if (result === HttpStatus.CREATED) {
					history.push('/');
				}
			} else {
				setMessage({color: 'error', msg: intl.formatMessage({id: 'captcha.wrong.text'})});
				loadSvgCaptcha();
			}
		}

		function renderAdditionalInformation() {
			return element({array: [{
				name: 'additionalDetails',
				type: 'textArea',
				label: intl.formatMessage({id: 'publicationRegistration.form.additionalDetails'}),
				width: 'half'
			}], classes, fieldName: 'additionalDetails'});
		}

		function renderPreview(publicationValues) {
			publicationValues = {
				...publicationValues,
				publicationTime: publicationValues.publicationTime
			};
			const formatPublicationValue = publicationValues.isbnClassification ?
				{
					...formatPublicationValues(publicationValues),
					isbnClassification: publicationValues.isbnClassification.map(item => item.label.toString())
				} : formatPublicationValues(publicationValues);
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
											formatPublicationValue.type === 'dissertation' ?
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
											label={intl.formatMessage({id: 'listComponent.phone'})}
											value={formatPublicationValue.publisher && formatPublicationValue.publisher.phone ? formatPublicationValue.publisher.phone : ''}
										/>
										<ListComponent
											label={intl.formatMessage({id: 'listComponent.contactPerson'})}
											value={formatPublicationValue.publisher && formatPublicationValue.publisher.contactPerson ? formatPublicationValue.publisher.contactPerson : ''}
										/>
										<ListComponent
											label={intl.formatMessage({id: 'listComponent.email'})}
											value={formatPublicationValue.publisher && formatPublicationValue.publisher.email ? formatPublicationValue.publisher.email : ''}
										/>
										{
											formatPublicationValue.type === 'dissertation' ?
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
							(formatPublicationValue.type !== 'dissertation' && formatPublicationValue.type !== 'map') &&
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
								(formatPublicationValue.type !== 'dissertation' && formatPublicationValue.type !== 'map') &&
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
								value={formatPublicationValue.type ? formatPublicationValue.type : ''}
							/>
							{
								formatPublicationValue.type === 'map' &&
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
				</Grid>
			);
		}

		function getSteps(fieldArray, dissFieldArray) {
			const result = [];
			if (isAuthenticated) {
				fieldArray.forEach((item, i) => {
					if (i >= 3) {
						result.push(Object.keys(item));
					}
				});
				if (user.role !== undefined && user.role === 'publisher') {
					return result.filter(i => i[0] !== 'additionalDetails');
				}

				return result;
			}

			if (!isAuthenticated && publicationValues && publicationValues.type && publicationValues.type.value === 'dissertation') {
				dissFieldArray.forEach(item => result.push(Object.keys(item)));
				fieldArray.forEach((item, i) => i >= 2 && result.push(Object.keys(item)));
				return result;
			}

			if (!isAuthenticated && publicationValues && publicationValues.type && publicationValues.type.value !== 'dissertation') {
				fieldArray.forEach(item => result.push(Object.keys(item)));
				result.splice(2, 1);
				return result;
			}
		}

		function getDissertationFieldArray(intl) {
			const dissertationFields = [
				{
					UniversityInfo: [
						{
							name: 'university[name]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.universityName'}),
							width: 'half',
							disable: publicationValues && typeof publicationValues.selectUniversity === 'object' && true
						},
						{
							name: 'university[city]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.city'}),
							width: 'half',
							disable: publicationValues && typeof publicationValues.selectUniversity === 'object' && true
						}
					]
				}
			];

			return dissertationFields;
		}

		function searchPublisherComponent() {
			const publisher = universityPublisher && universityPublisher.results.map(item => {
				return {
					title: item.name,
					place: item.city
				};
			});
			const val = publicationValues && publicationValues.university && Object.values(publicationValues.university);
			const checkDisable = val && val.some(item => item !== undefined);

			return [
				{
					name: 'selectUniversity',
					type: 'selectAutoComplete',
					label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.selectUniversity.label'}),
					width: 'half',
					placeholder: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.selectUniversity.placeholder'}),
					disable: checkDisable,
					options: publisher
				}
			];
		}

		function dissertCheckBox() {
			return [
				{
					name: 'insertUniversity',
					type: 'checkbox',
					label: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.insertUniversity.checkbox.label'}),
					width: 'half',
					info: intl.formatMessage({id: 'publicationRegistration.form.universityInfo.insertUniversity.checkbox.info'})
				}
			];
		}

		const typeOptions = user.role === 'publisher' ?
			[
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.book'}), value: 'book'},
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.dissertation'}), value: 'dissertation'},
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.map'}), value: 'map'}
			] :
			[
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.book'}), value: 'book'},
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.dissertation'}), value: 'dissertation'},
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.music'}), value: 'music'},
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.map'}), value: 'map'},
				{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.option.other'}), value: 'other'}
			];

		const component = (
			<>
				{typeSelect ?
					<Grid container className={classes.typeSelect} direction="row">
						{user.role !== 'publisher' &&
							<Grid item xs={12} className="select-useType">
								<Field
									disableClearable
									freeSolo
									name="isPublic"
									placeholder={intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.note.placeholder'})}
									className={classes.selectField}
									component={renderSelectAutoComplete}
									label={<FormattedMessage id="publicationRegistrationIsbnIsmn.form.isPubic.label"/>}
									options={[
										{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.note.option.yes'}), value: true},
										{title: intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.note.option.no'}), value: false}
									]}
								/>
								<Typography variant="h6" className="note-txt">
									<strong><FormattedMessage id="publicationRegistrationIsbnIsmn.form.note"/></strong>
								</Typography>
							</Grid>}
						<Grid item xs={12} className="select-useType">
							<Field
								disableClearable
								freeSolo
								name="type"
								placeholder={intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.type.placeholder'})}
								className={classes.selectField}
								component={renderSelectAutoComplete}
								label={<FormattedMessage id="publicationRegistrationIsbnIsmn.form.type.label"/>}
								options={typeOptions}
							/>
						</Grid>
						<Grid item xs={12} className="select-useType">
							{
								publicationValues && publicationValues.type && publicationValues.type.value === 'dissertation' && user.role !== 'publisher' &&
									<form>
										<Typography variant="body2" class={{margin: '30px 0 10px 0'}}>
											<FormattedMessage id="publicationRegistrationIsbnIsmn.form.checkbox.isbnFromUniversity.label"/>
											<strong><FormattedMessage id="publicationRegistrationIsbnIsmn.form.checkbox.isbnFromUniversity.labelBold"/></strong>
										</Typography>
										<FormControlLabel
											control={
												<Checkbox
													color="primary"
													checked={isbnFromUniversity}
													onChange={() => setIsbnFromUniversity(!isbnFromUniversity)}
												/>
											}
											label={intl.formatMessage({id: 'publicationRegistrationIsbnIsmn.form.checkbox.isbnFromUniversity'})}
										/>
									</form>
							}
						</Grid>
						<Button
							disabled={enableContinue()}
							variant="contained"
							color="primary"
							className="continue-button"
							onClick={handleContinueClick}
						>Continue
						</Button>
					</Grid> :
					<form className={classes.container} onSubmit={handleSubmit(handlePublicationRegistration)}>
						<div className={classes.topSticky}>
							<Typography variant="h5">
								<FormattedMessage id="app.modal.title.publicationRegistration"/> ISBN AND ISMN
							</Typography>
							<Stepper alternativeLabel activeStep={activeStep} className={classes.basicStepperStyle}>
								{steps.map(label => (
									<Step key={label}>
										<StepLabel className={classes.stepLabel}>
											{intl.formatMessage({id: `publicationRegistration.stepper.label.${label}`})}
										</StepLabel>
									</Step>
								))}
							</Stepper>
						</div>
						<div className={classes.subContainer}>
							<Grid container spacing={2} direction={activeStep === steps.length - 1 ? 'row' : 'column'}>
								{(getStepContent(activeStep))}
								{
									activeStep === steps.length - 1 &&
										<Grid item xs={12} className={classes.captchaContainer}>
											{isAuthenticated ? null : (
												<>
													<Captcha
														captchaInput={captchaInput}
														handleCaptchaInput={handleCaptchaInput}
														className={classes.captcha}/>
													{/* eslint-disable-next-line react/no-danger */}
													<span dangerouslySetInnerHTML={{__html: captcha.data}}/>
													<ResetCaptchaButton loadSvgCaptcha={loadSvgCaptcha}/>
												</>
											)}
										</Grid>
								}
							</Grid>
							<div className={classes.btnContainer}>
								<Button onClick={handleBack}>
									<FormattedMessage id="form.button.label.back"/>
								</Button>
								{activeStep === steps.length - 1 ?
									null :
									<Button type="button" disabled={(pristine || !valid) || activeStep === steps.length - 1} variant="contained" color="primary" onClick={handleNext}>
										<FormattedMessage id="form.button.label.next"/>
									</Button>}
								{
									activeStep === steps.length - 1 &&
										<Button type="submit" disabled={pristine || !valid} variant="contained" color="primary">
											<FormattedMessage id="form.button.label.submit"/>
										</Button>
								}
							</div>
						</div>
					</form>}
			</>
		);

		function enableContinue() {
			if (user.role !== undefined && user.role === 'publisher') {
				return publicationValues && !publicationValues.type;
			}

			if (publicationValues && publicationValues.type && publicationValues.type.value === 'dissertation') {
				return publicationValues && (!publicationValues.isPublic || !publicationValues.type || !isbnFromUniversity);
			}

			return publicationValues && (!publicationValues.isPublic || !publicationValues.type);
		}

		return {
			...component,
			defaultProps: {
				formSyncErros: null
			},
			propTypes: {

			}
		};

		function withFormTitle({arr, publicationValues, clearFields, formName}) {
			const comp = (
				<>
					{arr.map(item => (
						<Grid key={item.title} container spacing={2} direction="row">
							<div className={classes.formHead}>
								<Typography>
									{item.title} &nbsp; {item.title === 'Author Details' && <PopoverComponent icon={<HelpIcon/>} infoText={intl.formatMessage({id: 'form.instructionAddAuthor'})}/>}
								</Typography>
							</div>
							{item.title === 'Author Details' ? fieldArrayElement({data: item.fields, fieldName: 'authors', clearFields, formName}) : element({array: item.fields, publicationIsbnValues: publicationValues, classes, clearFields})}
						</Grid>

					))}
				</>
			);

			return {
				...comp
			};
		}
	}
));

function mapStateToProps(state) {
	return ({
		captcha: state.common.captcha,
		user: state.login.userInfo,
		initialValues: {
			language: formatLanguage(state.locale.lang),
			publisherLanguage: formatLanguage(state.locale.lang),
			insertUniversity: false
		},
		isAuthenticated: state.login.isAuthenticated,
		universityPublisher: state.publisher.universityPublisher,
		publicationValues: getFormValues('isbnIsmnRegForm')(state)
	});
}

export function getFieldArray(intl) {
	const fields = [
		{
			publisherBasicInfo: [
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
					label: <FormattedMessage id="publicationRegistration.form.basicInformation.contactPerson"/>,
					width: 'half'
				},
				{
					name: 'email',
					type: 'text',
					label: <FormattedMessage id="publicationRegistration.form.basicInformation.email"/>,
					width: 'half'
				}
			]
		},
		{
			publishingActivities: [
				{
					name: 'publicationDetails[frequency][currentYear]',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.publishingActivities.thisYear'}),
					width: 'half'
				},
				{
					name: 'publicationDetails[frequency][nextYear]',
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
			]
		},
		{
			contactInfo: [
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
			]
		},
		{
			basicInformation: [
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
					defaultValue: 'eng',
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
					name: 'publicationTime',
					type: 'dateTime',
					width: 'half',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.publicationTime'}),
					min: moment(Date.now()).format('YYYY-MM'),
					pattern: '[0-9]{4}-[0-9]{2}',
					formName: 'isbnIsmnRegForm'
				}
			]
		},
		{
			Authors: [
				{
					title: 'Author Details',
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
							instructions: getMultipleAndCreatableSelectInstruction(),
							label: intl.formatMessage({id: 'publicationRegistration.form.authors.role'}),
							width: 'half',
							options: [
								{label: '', value: ''},
								{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.author'}), value: 'tekijä'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.illustrator'}), value: 'kuvittaja'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.translator'}), value: 'kääntäjä'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.editor'}), value: 'toimittaja'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.authors.role.reader'}), value: 'lukija'}
							]
						}
					]
				}
			]
		},
		{
			Series: [
				{
					title: 'Series Details',
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
					]
				}
			]
		},
		{
			formatDetails: [
				{
					name: 'selectFormat',
					type: 'radio',
					width: 'half',
					options: [
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed'}), value: 'printed'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.electronic'}), value: 'electronic'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.both'}), value: 'both'}
					]
				}
			]
		},
		{
			additionalDetails: 'additionalDetails'
		},
		{
			preview: 'preview'
		}
	];

	return fields;
}
