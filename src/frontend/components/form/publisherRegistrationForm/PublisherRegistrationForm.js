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
import {connect} from 'react-redux';
import {reduxForm, getFormValues} from 'redux-form';
import {Button, Grid, Stepper, Step, StepLabel, Typography} from '@material-ui/core';
import PropTypes from 'prop-types';
import {validate} from '@natlibfi/identifier-services-commons';
import HttpStatus from 'http-status';
import {FormattedMessage, useIntl} from 'react-intl';

import useStyles from '../../../styles/form';
import ResetCaptchaButton from '../ResetCaptchaButton';
import ListComponent from '../../ListComponent';
import RenderInformation from './RenderInformation';
import Captcha from '../../Captcha';
import {fieldArray} from './formFieldVariable';
import * as actions from '../../../store/actions';
import {element} from '../commons';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'publisherRegistrationForm',
	initialValues: {
		language: 'eng',
		postalAddress:
			{
				public: false
			}
	},
	validate
})(
	props => {
		const {
			handleSubmit,
			clearFields,
			pristine,
			valid,
			publisherCreationRequest,
			captcha,
			loadSvgCaptcha,
			postCaptchaInput,
			publicationRegistration,
			handleSetPublisher,
			publisherValues,
			isAuthenticated,
			setMessage,
			history
		} = props;
		const classes = useStyles();
		const intl = useIntl();
		const [activeStep, setActiveStep] = useState(0);
		const [captchaInput, setCaptchaInput] = useState('');
		const [information, setInformation] = useState(true);

		useEffect(() => {
			if (!isAuthenticated) {
				loadSvgCaptcha();
			}
		}, [isAuthenticated, loadSvgCaptcha]);

		const steps = getSteps();
		function getStepContent(step) {
			switch (step) {
				case 0:
					return element({array: fieldArray[0].basicInformation, classes, clearFields});
				case 1:
					return element({array: fieldArray[1].publishingActivities, classes, clearFields});
				case 2:
					return element({array: fieldArray[2].organizationDetails, classes, clearFields});
				case 3:
					return renderPreview(publisherValues);
				default:
					return 'Unknown step';
			}
		}

		const handleCaptchaInput = e => {
			setCaptchaInput(e.target.value);
		};

		function handleNext() {
			setActiveStep(activeStep + 1);
		}

		function handleBack() {
			if (activeStep === 0) {
				return setInformation(true);
			}

			setActiveStep(activeStep - 1);
		}

		const handlePublisherRegistration = async values => {
			if (isAuthenticated) {
				const result = await publisherCreationRequest(formatPublisher(values));
				if (result === HttpStatus.CREATED) {
					setMessage({color: 'success', msg: 'Registration request sent successfully'});
					history.push('/');
				}
			} else if (captchaInput.length === 0) {
				setMessage({color: 'error', msg: <FormattedMessage id="publisherRegistration.form.submit.captchaEmptyError"/>});
			} else if (captchaInput.length > 0) {
				const result = await postCaptchaInput(captchaInput, captcha.id);
				await makeNewPublisherObj(values, result);
			}
		};

		function handleFormatPublisher() {
			handleSetPublisher(formatPublisher(publisherValues));
		}

		async function makeNewPublisherObj(values, result) {
			const newPublisher = formatPublisher(values);
			if (result === true) {
				const result = await publisherCreationRequest(newPublisher);
				if (result === HttpStatus.CREATED) {
					setMessage({color: 'success', msg: 'Registration request sent successfully'});
					history.push('/');
				} else {
					setMessage({color: 'error', msg: 'Registration request Failed'});
				}
			} else {
				setMessage({color: 'error', msg: intl.formatMessage({id: 'publisherRegistration.form.submit.captchaVerificationError'})});
				loadSvgCaptcha();
			}
		}

		function formatPublisher(values) {
			const newPublisherCategory = values.publisherCategory && values.publisherCategory.value;
			const newClassification = values.classification.map(item => item.value.toString());
			const publicationDetails = values.publicationDetails;
			const {affiliateOf, affiliates, distributorOf, distributor, ...rest} = {...values};

			const newPublisher = {
				...rest,
				publisherCategory: newPublisherCategory,
				classification: newClassification,
				publicationDetails: {...publicationDetails, frequency: {currentYear: Number(publicationDetails.frequency.currentYear), nextYear: Number(publicationDetails.frequency.nextYear)}}
			};
			return newPublisher;
		}

		const component = information ?
			(
				<RenderInformation setInformation={setInformation}/>
			) :
			(
				<form className={classes.container} onSubmit={handleSubmit(handlePublisherRegistration)}>
					<div className={classes.topSticky}>
						<Typography variant="h5">
							<FormattedMessage id="app.modal.title.publisherRegistration"/>
						</Typography>
						<Stepper alternativeLabel className={publicationRegistration && classes.smallStepper} activeStep={activeStep}>
							{steps.map(label => (
								<Step key={label}>
									<StepLabel className={publicationRegistration ? classes.smallFontStepLabel : classes.stepLabel}>
										<FormattedMessage id={`publisherRegistration.stepper.label.${label}`}/>
									</StepLabel>
								</Step>
							))}
						</Stepper>
					</div>
					<div className={classes.subContainer}>
						<Grid container spacing={2} direction={activeStep === steps.length - 1 ? 'row' : 'column'}>
							{(getStepContent(activeStep))}

							{(!publicationRegistration &&
							activeStep === steps.length - 1) &&
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
								</Grid>}
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
								(publicationRegistration ?
									(
										<Button type="button" disabled={pristine || !valid} variant="contained" color="primary" onClick={handleFormatPublisher}>
											<FormattedMessage id="form.button.label.next"/>
										</Button>
									) : (
										<Button type="submit" disabled={pristine || !valid} variant="contained" color="primary">
											<FormattedMessage id="form.button.label.submit"/>
										</Button>
									)
								)
							}
						</div>
					</div>
				</form>
			);

		function getSteps() {
			return fieldArray.map(item => Object.keys(item));
		}

		function renderPreview(publisherValues) {
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
									fieldName="language"
									label={intl.formatMessage({id: 'listComponent.language'})}
									value={publisherValues.language ? publisherValues.language : ''}
								/>
								<ListComponent
									fieldName="email"
									label={intl.formatMessage({id: 'listComponent.email'})}
									value={publisherValues.email ? publisherValues.email : ''}
								/>
								<ListComponent
									fieldName="givenName"
									label={intl.formatMessage({id: 'listComponent.givenName'})}
									value={publisherValues.givenName ? publisherValues.givenName : ''}
								/>
								<ListComponent
									fieldName="familyName"
									label={intl.formatMessage({id: 'listComponent.familyName'})}
									value={publisherValues.familyName ? publisherValues.familyName : ''}
								/>
								<ListComponent
									fieldName="publisherType"
									label={intl.formatMessage({id: 'listComponent.publisherType'})}
									value={publisherValues.publisherType ? publisherValues.publisherType : ''}
								/>
								<ListComponent
									fieldName="creator"
									label={intl.formatMessage({id: 'listComponent.creator'})}
									value={publisherValues.creator ? publisherValues.creator : ''}
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
									value={publisherValues && publisherValues.postalAddress && publisherValues.postalAddress.address ?
										publisherValues.postalAddress.address : ''}
								/>
								<ListComponent
									fieldName="postalAddress[city]"
									label={intl.formatMessage({id: 'listComponent.city'})}
									value={publisherValues && publisherValues.postalAddress && publisherValues.postalAddress.city ?
										publisherValues.postalAddress.city : ''}
								/>
								<ListComponent
									fieldName="postalAddress[zip]"
									label={intl.formatMessage({id: 'listComponent.zip'})}
									value={publisherValues && publisherValues.postalAddress && publisherValues.postalAddress.zip ?
										publisherValues.postalAddress.zip : ''}
								/>
								<ListComponent
									fieldName="postalAddress[public]"
									label={intl.formatMessage({id: 'listComponent.public'})}
									value={publisherValues && publisherValues.postalAddress && publisherValues.postalAddress.public ?
										publisherValues.postalAddress.public : ''}
								/>
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
								value={publisherValues && publisherValues.organizationDetails && publisherValues.organizationDetails.affiliate ?
									publisherValues.organizationDetails.affiliate : ''}
							/>
							<ListComponent
								fieldName="organizationalDetails[distributor]"
								label={intl.formatMessage({id: 'listComponent.distributor'})}
								value={publisherValues && publisherValues.organizationDetails && publisherValues.organizationDetails.distributor ?
									publisherValues.organizationDetails.distributor : ''}
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
								value={publisherValues.aliases ? publisherValues.aliases : []}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								Frequency
							</Typography>
							<hr/>
							<ListComponent
								fieldName="publicationDetails[frequency][currentYear]"
								label={intl.formatMessage({id: 'listComponent.currentYear'})}
								value={publisherValues && publisherValues.publicationDetails && publisherValues.publicationDetails.frequency && publisherValues.publicationDetails.frequency.currentYear ?
									publisherValues.publicationDetails.frequency.currentYear : ''}
							/>
							<ListComponent
								fieldName="publicationDetails[frequency][currentYear]"
								label={intl.formatMessage({id: 'listComponent.nextYear'})}
								value={publisherValues && publisherValues.publicationDetails && publisherValues.publicationDetails.frequency && publisherValues.publicationDetails.frequency.nextYear ?
									publisherValues.publicationDetails.frequency.nextYear : ''}
							/>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.classification"/>
							</Typography>
							<hr/>
							<Grid container style={{display: 'flex', flexDirection: 'column'}}>
								<ListComponent fieldName="classification"
									label={intl.formatMessage({id: 'listComponent.classification'})}
									value={publisherValues.classification ? publisherValues.classification.map(i => i.value) : []}
								/>
							</Grid>
						</Grid>
						<Grid item xs={12}>
							<Typography variant="h6">
								<FormattedMessage id="listComponent.notes"/>
							</Typography>
							<hr/>
							<ListComponent
								fieldName="notes"
								label={intl.formatMessage({id: 'listComponent.notes'})}
								value={publisherValues.notes ? publisherValues.notes : ''}
							/>
						</Grid>
					</Grid>
				</Grid>

			);
		}

		return {
			...component,
			defaultProps: {
				formSyncErrors: null
			},
			propTypes: {
				handleSubmit: PropTypes.func.isRequired,
				pristine: PropTypes.bool.isRequired,
				formSyncErrors: PropTypes.shape({}),
				valid: PropTypes.bool.isRequired
			}
		};
	}));

function mapStateToProps(state) {
	return ({
		captcha: state.common.captcha,
		isAuthenticated: state.login.isAuthenticated,
		publisherValues: getFormValues('publisherRegistrationForm')(state)
	});
}

