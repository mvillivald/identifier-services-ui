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
import {Field, reduxForm} from 'redux-form';
import {PropTypes} from 'prop-types';
import {Grid, Button} from '@material-ui/core';
import {validate} from '../../utils';
import {connect} from 'react-redux';
import {useIntl, FormattedMessage} from 'react-intl';

import renderTextField from './render/renderTextField';
import ResetCaptchaButton from './ResetCaptchaButton';
import renderTextArea from './render/renderTextArea';
import useStyles from '../../styles/form';
import * as actions from '../../store/actions';
import Captcha from '../Captcha';

export default connect(mapToProps, actions)(reduxForm({
	form: 'contactForm', validate
})(
	props => {
		const {
			handleSubmit,
			pristine,
			valid,
			sendMessage,
			handleClose,
			loadSvgCaptcha,
			postCaptchaInput,
			isAuthenticated,
			setMessage,
			captcha
		} = props;
		const intl = useIntl();
		const initialState = {};
		const [state, setState] = useState(initialState);
		const [captchaInput, setCaptchaInput] = useState('');
		const classes = useStyles();
		useEffect(() => {
			if (!isAuthenticated) {
				loadSvgCaptcha();
			}
		}, [isAuthenticated, loadSvgCaptcha]);

		const handleCaptchaInput = e => {
			setCaptchaInput(e.target.value);
		};

		const handleClick = async values => {
			setState({...state, values});
			if (isAuthenticated) {
				sendMessage(values);
			} else {
				// eslint-disable-next-line no-lonely-if
				if (captchaInput.length === 0) {
					setMessage({color: 'error', msg: intl.formatMessage({id: 'captcha.notprovided'})});
				} else if (captchaInput.length > 0) {
					const result = await postCaptchaInput(captchaInput, captcha.id);
					if (result === true) {
						sendMessage(values);
					} else {
						setMessage({color: 'error', msg: intl.formatMessage({id: 'captcha.wrong.text'})});
						loadSvgCaptcha();
					}
				}
			}

			handleClose();
		};

		const fieldArray = [
			{
				name: 'name',
				type: 'text',
				label: intl.formatMessage({id: 'contact.form.name'}),
				width: 'full'
			},
			{
				name: 'email',
				type: 'text',
				label: intl.formatMessage({id: 'contact.form.email'}),
				width: 'full'
			},
			{
				name: 'description',
				type: 'multiline',
				label: intl.formatMessage({id: 'contact.form.description'}),
				width: 'full'
			}
		];

		const component = (
			<form className={classes.container} onSubmit={handleSubmit(handleClick)}>
				<Grid container className={classes.subContainer} spacing={3} direction="row">
					{
						fieldArray.map(list => (
							(list.type === 'text') ?
								<Grid key={list.name} item xs={12}>
									<Field
										className={classes.textField}
										component={renderTextField}
										label={list.label}
										name={list.name}
										type={list.type}
									/>
								</Grid> :
								<Grid key={list.name} item xs={12}>
									<Field
										className={classes.textArea}
										component={renderTextArea}
										label={list.label}
										name={list.name}
										type={list.type}
									/>
								</Grid>
						))
					}
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
					<Grid item xs={12} className={classes.btnContainer}>
						<Button
							disabled={pristine || !valid}
							variant="contained"
							color="primary"
							type="submit"
							size="small"
							fullWidth={false}
						>
							<FormattedMessage id="form.button.label.submit"/>
						</Button>
					</Grid>
				</Grid>
			</form>
		);

		return {
			...component,
			propTypes: {
				handleSubmit: PropTypes.func.isRequired,
				pristine: PropTypes.bool.isRequired
			}
		};
	}));

function mapToProps(state) {
	return ({
		isAuthenticated: state.login.isAuthenticated,
		captcha: state.common.captcha,
		language: state.locale.lang
	});
}
