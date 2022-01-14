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
import {validate} from '../../../utils';
import HttpStatus from 'http-status';
import {FormattedMessage, useIntl} from 'react-intl';

import useStyles from '../../../styles/form';
import ResetCaptchaButton from '../ResetCaptchaButton';
import RenderInformation from './RenderInformation';
import Captcha from '../../Captcha';
import * as actions from '../../../store/actions';
import {formatLanguage} from '../commons';
import {getSteps, getStepContent} from './logic';
import {formatPublisher} from './utils';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'publisherRegistrationForm',
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

		const steps = getSteps();
		const getStepCountProps = {
			activeStep, clearFields, classes, publisherValues, intl
		};

		useEffect(() => {
			if (!isAuthenticated) {
				loadSvgCaptcha();
			}
		}, [isAuthenticated, loadSvgCaptcha]);

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
							{(getStepContent(getStepCountProps))}
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
		initialValues: {
			language: formatLanguage(state.locale.lang),
			postalAddress:
				{
					public: false
				}
		},
		isAuthenticated: state.login.isAuthenticated,
		publisherValues: getFormValues('publisherRegistrationForm')(state)
	});
}

