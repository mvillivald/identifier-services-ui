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

/* global COOKIE_NAME */
/* eslint-disable capitalized-comments, no-unused-vars */

import React, {useState} from 'react';
import {reduxForm, getFormValues} from 'redux-form';
import {validate} from './validation';
import {Button, Grid, Stepper, Step, StepLabel, Typography} from '@material-ui/core';
import {connect} from 'react-redux';
import {useCookies} from 'react-cookie';
import {FormattedMessage, useIntl} from 'react-intl';
import HttpStatus from 'http-status';

import * as actions from '../../../store/actions';
import useStyles from '../../../styles/form';
import ResetCaptchaButton from '../ResetCaptchaButton';
import Captcha from '../../Captcha';
import {element, fieldArrayElement, formatLanguage} from '../commons';

import {getFormPages} from './content';
import {filterFormFields, getSteps} from './logic';
import {formatPublicationValues} from './utils';
import {renderPreview} from './preview';

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
			// getUniversityPublisher,
			// universityPublisher,
			setMessage,
			// handleSubmit,
			history,
			location,
			lang
		} = props;

		// Local state
		const intl = useIntl();
		const classes = useStyles();
		const [activeStep, setActiveStep] = useState(0);
		const [captchaInput, setCaptchaInput] = useState('');
		const [typeSelect, setTypeSelect] = useState(true);
		const [isbnFromUniversity, setIsbnFromUniversity] = useState(false);
		const {prevPath} = location.state !== undefined && location.state;
		const [cookie] = useCookies(COOKIE_NAME);

		// Form field content
		const formPages = getFormPages(intl);
		const content = filterFormFields(formPages, publicationValues);
		const contentOrder = getSteps(isAuthenticated, publicationValues);
		const activeContent = (activeStep > contentOrder.length - 1 && activeStep < contentOrder.length - 1) ? undefined : content[contentOrder[activeStep]];

		const handleCaptchaInput = e => {
			setCaptchaInput(e.target.value);
		};

		function handleNext() {
			setActiveStep(activeStep + 1);
		}

		function handleBack() {
			setActiveStep(activeStep - 1);
		}

		function handleSubmit(e) {
			e.preventDefault();
			console.log('Submitted');
		}

		const component = (
			<>
				<form className={classes.container} onSubmit={e => handleSubmit(e)}>
					<div className={classes.topSticky}>
						<Typography variant="h5">
							<FormattedMessage id="app.modal.title.publicationRegistration"/> ISBN AND ISMN
						</Typography>
						<Stepper alternativeLabel activeStep={activeStep} className={classes.basicStepperStyle}>
							{contentOrder.map(label => (
								<Step key={label}>
									<StepLabel className={classes.stepLabel}>
										{intl.formatMessage({id: `publicationRegistration.stepper.label.${label}`})}
									</StepLabel>
								</Step>
							))}
						</Stepper>
					</div>
					<div className={classes.subContainer}>
						<Grid container spacing={2} direction={activeStep === content.length - 1 ? 'row' : 'column'}>
							{activeContent && activeContent.renderType === 'element' && element({array: activeContent.fields, classes, clearFields, publicationIsbnValues: publicationValues})}
							{activeContent && activeContent.renderType === 'fieldArray' && fieldArrayElement({data: activeContent.fields, fieldName: activeContent.name, clearFields, formName: 'isbnIsmnRegForm'})}
							{
								activeStep === content.length - 1 &&
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
							<Button type="button" disabled={activeStep < 1} onClick={handleBack}>
								<FormattedMessage id="form.button.label.back"/>
							</Button>
							{activeStep === contentOrder.length ?
								null :
								<Button type="button" disabled={!valid} variant="contained" color="primary" onClick={handleNext}>
									<FormattedMessage id="form.button.label.next"/>
								</Button>}
							{
								activeStep === contentOrder.length &&
								renderPreview(publicationValues, isAuthenticated, user, intl, clearFields)
							}
						</div>
					</div>
				</form>
			</>
		);

		return {
			...component,
			defaultProps: {
				formSyncErros: null
			},
			propTypes: {}
		};
	}
));

function mapStateToProps(state) {
	return ({
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
