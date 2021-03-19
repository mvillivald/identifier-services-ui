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
import {reduxForm, getFormValues} from 'redux-form';
import {validate} from '@natlibfi/identifier-services-commons';
import {Button, Grid, Stepper, Step, StepLabel, Typography} from '@material-ui/core';
import {connect} from 'react-redux';
import HttpStatus from 'http-status';
import {useCookies} from 'react-cookie';
import {useIntl, FormattedMessage} from 'react-intl';

import ResetCaptchaButton from './ResetCaptchaButton';
import * as actions from '../../store/actions';
import useStyles from '../../styles/form';
import Captcha from '../Captcha';
import ListComponent from '../ListComponent';
import {element as publisherElement, fieldArrayElement} from './commons';
import {getMultipleSelectInstruction, getCreateableSelectInstruction, formatLanguage} from './commons';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'issnRegForm',
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
			setMessage,
			isAuthenticated,
			publicationCreation,
			publicationCreationRequest,
			handleSubmit,
			history
		} = props;

		const intl = useIntl();
		const fieldArray = getFieldArray(intl);
		const classes = useStyles();
		const [activeStep, setActiveStep] = useState(0);
		const [captchaInput, setCaptchaInput] = useState('');
		/* global COOKIE_NAME */
		const [cookie] = useCookies(COOKIE_NAME);
		const steps = getSteps(fieldArray);
		useEffect(() => {
			if (!isAuthenticated) {
				loadSvgCaptcha();
			}
		}, [isAuthenticated, loadSvgCaptcha]);

		function getStepContent(step) {
			if (isAuthenticated) {
				switch (step) {
					case 0:
						return publisherElement({array: fieldArray[1].basicInformation, classes, clearFields});
					case 1:
						return withFormTitle({arr: fieldArray[2].Time, publicationValues, clearFields});
					case 2:
						return withFormTitle({arr: fieldArray[3].PreviousPublication, publicationValues, clearFields});
					case 3:
						return withFormTitle({arr: fieldArray[4].SeriesDetails, publicationValues, clearFields});
					case 4:
						return publisherElement({array: fieldArray[5].formatDetails, publicationIssnValues: publicationValues, classes, clearFields, intl});
					case 5:
						return renderAdditionalInformation();
					case 6:
						return renderPreview(publicationValues);
					default:
						return 'Unknown step';
				}
			}

			if (!isAuthenticated) {
				switch (step) {
					case 0:
						return publisherElement({array: fieldArray[0].publisherBasicInfo, classes, clearFields});
					case 1:
						return publisherElement({array: fieldArray[1].basicInformation, classes, clearFields});
					case 2:
						return withFormTitle({arr: fieldArray[2].Time, publicationValues, clearFields});
					case 3:
						return withFormTitle({arr: fieldArray[3].PreviousPublication, publicationValues, clearFields});
					case 4:
						return withFormTitle({arr: fieldArray[4].SeriesDetails, publicationValues, clearFields});
					case 5:
						return publisherElement({array: fieldArray[5].formatDetails, publicationIssnValues: publicationValues, classes, clearFields, intl});
					case 6:
						return renderAdditionalInformation();
					case 7:
						return renderPreview(publicationValues);
					default:
						return 'Unknown step';
				}
			}
		}

		const handleCaptchaInput = e => {
			setCaptchaInput(e.target.value);
		};

		function handleNext() {
			setActiveStep(activeStep + 1);
		}

		function handleBack() {
			setActiveStep(activeStep - 1);
		}

		async function handlePublicationRegistration(values) {
			if (isAuthenticated) {
				const result = await publicationCreation({values: formatPublicationValues(values), token: cookie[COOKIE_NAME], subType: 'issn'});
				if (result === HttpStatus.CREATED) {
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
			const publisher = isAuthenticated ? user.publisher : {
				name: values.name,
				contactPerson: values.contactPerson,
				postalAddress: values.postalAddress,
				publisherEmail: values.email,
				phone: values.phone,
				language: values.publisherLanguage,
				aliases: values.aliases && values.aliases
			};
			const {name, postalAddress, publisherEmail, phone, publisherLanguage, issnFormatDetails, formatDetails, ...formattedPublicationValues} = {
				...values,
				publisher,
				firstNumber: values.firstNumber,
				firstYear: Number(values.firstYear),
				frequency: values.frequency.value,
				previousPublication: values.previousPublication && {
					...values.previousPublication,
					lastYear: values.previousPublication.lastYear && Number(values.previousPublication.lastYear),
					lastNumber: values.previousPublication.lastNumber && values.previousPublication.lastNumber
				},
				type: values.type.value
			};
			return {...formattedPublicationValues, formatDetails: reFormat(values)};

			function reFormat(value) {
				const {issnFormatDetails, formatDetails} = value;
				return issnFormatDetails.reduce((acc, item) => {
					const data = item.value === 'online' ? {format: item.value, url: formatDetails.url} : {format: item.value};
					acc.push(data);
					return acc;
				}, []);
			}
		}

		async function submitPublication(values, result) {
			if (result === true) {
				const result = await publicationCreationRequest({values: values, subType: 'issn'});
				if (result === HttpStatus.CREATED) {
					history.push('/');
				}
			} else {
				setMessage({color: 'error', msg: intl.formatMessage({id: 'captcha.wrong.text'})});
				loadSvgCaptcha();
			}
		}

		function renderAdditionalInformation() {
			return publisherElement({array: [{
				name: 'additionalDetails',
				type: 'textArea',
				label: intl.formatMessage({id: 'publicationRegistration.form.additionalDetails'}),
				width: 'half'
			}], classes, fieldName: 'additionalDetails'});
		}

		function renderPreview(publicationValues) {
			const values = formatPublicationValues(publicationValues);
			const {seriesDetails, ...formatValues} = {
				...values,
				mainSeries: values.seriesDetails && values.seriesDetails.mainSeries,
				subSeries: values.seriesDetails && values.seriesDetails.subSeries
			};
			return (
				<Grid container item spacing={2} xs={12}>
					<Grid container item xs={6} md={6} spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.basicInformations"/>
							</Typography>
							<hr/>
							<ListComponent fieldName="title" label={intl.formatMessage({id: 'listComponent.title'})} value={formatValues.title ? formatValues.title : ''}/>
							<ListComponent fieldName="subtitle" label={intl.formatMessage({id: 'listComponent.subtitle'})} value={formatValues.subTitle ? formatValues.subTitle : ''}/>
							<ListComponent fieldName="manufacturer" label={intl.formatMessage({id: 'listComponent.manufacturer'})} value={formatValues.manufacturer ? formatValues.manufacturer : ''}/>
							<ListComponent fieldName="city" label={intl.formatMessage({id: 'listComponent.city'})} value={formatValues.city ? formatValues.city : ''}/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.publisher"/>&nbsp;
								<FormattedMessage id="listComponent.informations"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="publisher[name]"
								label={intl.formatMessage({id: 'listComponent.name'})}
								value={formatValues.publisher && formatValues.publisher.name ? formatValues.publisher.name : ''}
							/>
							<ListComponent
								fieldName="publisher[postalAddress][address]"
								label={intl.formatMessage({id: 'listComponent.address'})}
								value={formatValues.publisher && formatValues.publisher.postalAddress && formatValues.publisher.postalAddress ?
									formatValues.publisher.postalAddress.address && formatValues.publisher.postalAddress.address :
									(formatValues.publisher && formatValues.publisher.address ?
										formatValues.publisher.address :
										'')}
							/>
							<ListComponent
								fieldName="publisher[postalAddress][zip]"
								label={intl.formatMessage({id: 'listComponent.zip'})}
								value={formatValues.publisher && formatValues.publisher.postalAddress && formatValues.publisher.postalAddress ?
									formatValues.publisher.postalAddress.zip && formatValues.publisher.postalAddress.zip :
									(formatValues.publisher && formatValues.publisher.zip ?
										formatValues.publisher.zip :
										'')}
							/>
							<ListComponent
								fieldName="publisher[postalAddress][city]"
								label={intl.formatMessage({id: 'listComponent.city'})}
								value={formatValues.publisher && formatValues.publisher.postalAddress && formatValues.publisher.postalAddress ?
									formatValues.publisher.postalAddress.city && formatValues.publisher.postalAddress.city :
									(formatValues.publisher && formatValues.publisher.city ?
										formatValues.publisher.city :
										'')}
							/>
							<ListComponent
								fieldName="publisher[phone]"
								label={intl.formatMessage({id: 'listComponent.phone'})}
								value={formatValues.publisher && formatValues.publisher.phone ? formatValues.publisher.phone : ''}
							/>
							<ListComponent
								fieldName="publisher[contactPerson]"
								label={intl.formatMessage({id: 'listComponent.contactPerson'})}
								value={formatValues.publisher && formatValues.publisher.contactPerson ? formatValues.publisher.contactPerson : ''}
							/>
							<ListComponent
								fieldName="publisher[email]"
								label={intl.formatMessage({id: 'listComponent.email'})}
								value={formatValues.publisher && formatValues.publisher.email ? formatValues.publisher.email : ''}
							/>
							<ListComponent
								fieldName="publisher[language]"
								label={intl.formatMessage({id: 'listComponent.language'})}
								value={formatValues.publisher && formatValues.publisher.language ? formatValues.publisher.language : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.mainSeries"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="seriesDetails[mainSeries][title]"
								label={intl.formatMessage({id: 'listComponent.title'})}
								value={formatValues.seriesDetails ?
									(formatValues.seriesDetails.mainSeries ?
										(formatValues.seriesDetails.mainSeries.title ?
											formatValues.seriesDetails.mainSeries.title :
											''
										) :
										''
									) :	''}
							/>
							<ListComponent
								fieldName="seriesDetails[mainSeries][identifier]"
								label={intl.formatMessage({id: 'listComponent.identifier'})}
								value={formatValues.seriesDetails ?
									(formatValues.seriesDetails.mainSeries ?
										(formatValues.seriesDetails.mainSeries.identifier ?
											formatValues.seriesDetails.mainSeries.identifier :
											''
										) :
										''
									) : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.subSeries"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="seriesDetails[subSeries][title]"
								label={intl.formatMessage({id: 'listComponent.title'})}
								value={formatValues.seriesDetails ?
									(formatValues.seriesDetails.subSeries ?
										(formatValues.seriesDetails.subSeries.title ?
											formatValues.seriesDetails.subSeries.title :
											''
										) :
										''
									) : ''}
							/>
							<ListComponent
								fieldName="seriesDetails[subSeries][identifier]"
								label={intl.formatMessage({id: 'listComponent.identifier'})}
								value={formatValues.seriesDetails ?
									(formatValues.seriesDetails.subSeries ?
										(formatValues.seriesDetails.subSeries.identifier ?
											formatValues.seriesDetails.subSeries.identifier :
											''
										) :
										''
									) : ''}
							/>
						</Grid>
					</Grid>
					<Grid container item xs={6} md={6} spacing={2}>
						<Grid item xs={12}>
							<Typography variant="h6">
								Time Details
							</Typography>
							<hr/>
							<ListComponent fieldName="firstYear" label={intl.formatMessage({id: 'listComponent.firstYear'})} value={formatValues.firstYear ? formatValues.firstYear : ''}/>
							<ListComponent fieldName="firstNumber" label={intl.formatMessage({id: 'listComponent.firstNumber'})} value={formatValues.firstNumber ? formatValues.firstNumber : ''}/>
							<ListComponent fieldName="frequency" label={intl.formatMessage({id: 'listComponent.frequency'})} value={formatValues.frequency ? formatValues.frequency : ''}/>
							<ListComponent fieldName="type" label={intl.formatMessage({id: 'listComponent.type'})} value={formatValues.type ? formatValues.type : ''}/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.previouslyPublished"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="previousPublication[lastYear]"
								label={intl.formatMessage({id: 'listComponent.lastYear'})}
								value={formatValues.previousPublication ?
									(formatValues.previousPublication.lastYear ?
										formatValues.previousPublication.lastYear :
										''
									) : ''}
							/>
							<ListComponent
								fieldName="previousPublication[lastNumber]"
								label={intl.formatMessage({id: 'listComponent.lastNumber'})}
								value={formatValues.previousPublication ?
									(formatValues.previousPublication.lastNumber ?
										formatValues.previousPublication.lastNumber :
										''
									) : ''}
							/>
							<ListComponent
								fieldName="previousPublication[title]"
								label={intl.formatMessage({id: 'listComponent.title'})}
								value={formatValues.previousPublication ?
									(formatValues.previousPublication.title ?
										formatValues.previousPublication.title :
										''
									) : ''}
							/>
							<ListComponent
								fieldName="previousPublication[identifier]"
								label={intl.formatMessage({id: 'listComponent.identifier'})}
								value={formatValues.previousPublication ?
									(formatValues.previousPublication.identifier ?
										formatValues.previousPublication.identifier :
										''
									) : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.formatDetails"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="issnFormatDetails"
								label={intl.formatMessage({id: 'listComponent.selectFormat'})}
								value={formatValues.formatDetails ? formatValues.formatDetails : []}
							/>
							<ListComponent
								label={intl.formatMessage({id: 'listComponent.url'})}
								value={formatValues.formatDetails ?
									(formatValues.formatDetails.url ?
										formatValues.formatDetails.url :
										''
									) : ''}
							/>
							<ListComponent
								fieldName="manufacturer"
								label={intl.formatMessage({id: 'listComponent.manufacturer'})}
								value={formatValues.manufacturer ?
									formatValues.manufacturer : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.additionalDetails"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="additionalDetails"
								value={formatValues.additionalDetails ? formatValues.additionalDetails : ''}
							/>
						</Grid>
					</Grid>
				</Grid>

			);
		}

		const component = (
			<form className={classes.container} onSubmit={handleSubmit(handlePublicationRegistration)}>
				<div className={classes.topSticky}>
					<Typography variant="h5">
						<FormattedMessage id="app.modal.title.publicationRegistration"/> ISSN
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
						<Button disabled={activeStep === 0} onClick={handleBack}>
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
			</form>
		);

		return {
			...component,
			defaultProps: {
				formSyncErros: null
			},
			propTypes: {

			}
		};

		function withFormTitle({arr, publicationValues, clearFields}) {
			const comp = (
				<>
					{arr.map(item => (
						<Grid key={item.title} container spacing={2} direction="row">
							<div className={classes.formHead}>
								<Typography>
									{item.title}
								</Typography>
							</div>
							{item.title === 'Author Details' ?
								fieldArrayElement({data: item.fields, fieldName: 'authors', clearFields}) :
								publisherElement({array: item.fields, classes, clearFields, publicationIssnValues: publicationValues})}
						</Grid>

					))}
				</>
			);

			return {
				...comp
			};
		}

		function getSteps(fieldArray) {
			const result = [];
			if (isAuthenticated) {
				fieldArray.forEach((item, i) => {
					if (i >= 1) {
						result.push(Object.keys(item));
					}
				});
				return result;
			}

			return fieldArray.map(item => Object.keys(item));
		}
	}
));

function mapStateToProps(state) {
	return ({
		language: state.locale.lang,
		initialValues: {
			language: formatLanguage(state.locale.lang),
			publisherLanguage: formatLanguage(state.locale.lang),
			postalAddress:
				{
					public: false
				}
		},
		captcha: state.common.captcha,
		user: state.login.userInfo,
		isAuthenticated: state.login.isAuthenticated,
		publicationValues: getFormValues('issnRegForm')(state)
	});
}

function getFieldArray(intl) {
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
					label: <FormattedMessage id="publisherRegistration.form.basicInformation.contactPerson"/>,
					width: 'half'
				},
				{
					name: 'email',
					type: 'text',
					label: <FormattedMessage id="publisherRegistration.form.basicInformation.email"/>,
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
					name: 'city',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.city'}),
					width: 'half'
				}
			]
		},
		{
			Time: [
				{
					title: 'Time Details',
					fields: [
						{
							name: 'firstYear',
							type: 'numeric',
							label: intl.formatMessage({id: 'publicationRegistration.form.Time.firstYear'}),
							width: 'half'
						},
						{
							name: 'firstNumber',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.Time.firstNumber'}),
							width: 'half'
						},
						{
							name: 'frequency',
							type: 'multiSelect',
							width: 'half',
							label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency'}),
							options: [
								{label: '', value: ''},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.yearly'}), value: 'yearly'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.monthly'}), value: 'monthly'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.weekly'}), value: 'weekly'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.daily'}), value: 'daily'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.biyearly'}), value: 'bi-yearly'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.quarterly'}), value: 'quarterly'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.bimonthly'}), value: 'bi-monthly'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.continuously'}), value: 'continuously'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.frequency.irregular'}), value: 'irregular'}

							]
						},
						{
							name: 'type',
							type: 'multiSelect',
							width: 'half',
							label: intl.formatMessage({id: 'publicationRegistration.form.Time.type'}),
							options: [
								{label: '', value: ''},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.journal'}), value: 'journal'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.newsletter'}), value: 'newsletter'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.staffmagazine'}), value: 'staff-magazine'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.membershipmagazine'}), value: 'membership-magazine'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.cartoon'}), value: 'cartoon'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.newspaper'}), value: 'newspaper'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.freepaper'}), value: 'free-paper'},
								{label: intl.formatMessage({id: 'publicationRegistration.form.Time.type.monography'}), value: 'monography'}

							]
						}
					]
				}
			]
		},
		{
			PreviousPublication: [
				{
					title: 'Previous Publication',
					fields: [
						{
							name: 'previousPublication[title]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.PreviousPublication.title'}),
							width: 'half'
						},
						{
							name: 'previousPublication[identifier]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.PreviousPublication.identifier'}),
							width: 'half'
						},
						{
							name: 'previousPublication[lastYear]',
							type: 'numeric',
							label: intl.formatMessage({id: 'publicationRegistration.form.PreviousPublication.lastYear'}),
							width: 'half'
						},
						{
							name: 'previousPublication[lastNumber]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.PreviousPublication.lastNumber'}),
							width: 'half'
						}
					]
				},
				{
					title: 'Other Medium',
					fields: [
						{
							name: 'otherMedium[title]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.PreviousPublication.title'}),
							width: 'half'
						},
						{
							name: 'otherMedium[identifier]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.PreviousPublication.identifier'}),
							width: 'half'
						}
					]
				}
			]
		},
		{
			SeriesDetails: [
				{
					title: 'Main Series',
					fields: [
						{
							name: 'seriesDetails[mainSeries[title]]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.seriesDetails.title'}),
							width: 'half'
						},
						{
							name: 'seriesDetails[mainSeries[identifier]]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.seriesDetails.identifier'}),
							width: 'half'
						}
					]
				},
				{
					title: 'Sub Series',
					fields: [
						{
							name: 'seriesDetails[subSeries[title]]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.seriesDetails.title'}),
							width: 'half'
						},
						{
							name: 'seriesDetails[subSeries[identifier]]',
							type: 'text',
							label: intl.formatMessage({id: 'publicationRegistration.form.seriesDetails.identifier'}),
							width: 'half'
						}
					]
				}
			]
		},
		{
			formatDetails: [
				{
					name: 'issnFormatDetails',
					type: 'multiSelect',
					width: 'half',
					isMulti: true,
					isCreatable: true,
					instructions: getIssnFormatDetailsInstruction(),
					label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails'}),
					options: [
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.printed'}), value: 'printed'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.online'}), value: 'online'},
						{label: intl.formatMessage({id: 'publicationRegistration.form.formatDetails.cdRom'}), value: 'CD-ROM'}
					]
				},
				{
					name: 'manufacturer',
					type: 'text',
					label: intl.formatMessage({id: 'publicationRegistration.form.basicInformation.manufacturer'}),
					width: 'half'
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

function getIssnFormatDetailsInstruction() {
	return (
		<>
			{getMultipleSelectInstruction()}
			{getCreateableSelectInstruction()}
		</>
	);
}
