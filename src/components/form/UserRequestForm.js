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
import React from 'react';
import {connect} from 'react-redux';
import {Field, reduxForm} from 'redux-form';
import {Button, Grid} from '@material-ui/core';
import PropTypes from 'prop-types';
import {validate} from '../../utils';
import {useCookies} from 'react-cookie';
import {FormattedMessage} from 'react-intl';

import renderTextField from './render/renderTextField';
import renderRadioButton from './render/renderRadioButton';
import useStyles from '../../styles/form';
import * as actions from '../../store/actions/userActions';

const fieldArray = [
	{
		name: 'email',
		type: 'email',
		label: <FormattedMessage id="userCreation.form.label.email"/>,
		width: 'full'
	},
	{
		name: 'givenName',
		type: 'text',
		label: <FormattedMessage id="userCreation.form.label.givenName"/>,
		width: 'half'
	},
	{
		name: 'familyName',
		type: 'text',
		label: <FormattedMessage id="userCreation.form.label.familyName"/>,
		width: 'half'
	},
	{
		name: 'SSOId',
		type: 'text',
		label: <FormattedMessage id="userCreation.form.label.ssoId"/>,
		width: 'half'
	}
];

export default connect(null, actions)(reduxForm({
	form: 'userCreation',
	validate
})(
	props => {
		const {handleSubmit, valid, createUserRequest, pristine, handleClose, setIsCreating} = props;
		const classes = useStyles();
		/* global COOKIE_NAME */
		const [cookie] = useCookies(COOKIE_NAME);
		const token = cookie[COOKIE_NAME];

		async function handleCreateUser(values) {
			const newUser = {
				...values,
				givenName: values.givenName.toLowerCase(),
				familyName: values.familyName.toLowerCase()
			};

			await createUserRequest(newUser, token);

			handleClose();
			setIsCreating(true);
		}

		const component = (
			<form className={classes.container} onSubmit={handleSubmit(handleCreateUser)}>
				<div className={classes.subContainer}>
					<Grid container spacing={3} direction="row">
						{fieldArray.map(list => {
							return element(list, classes);
						})}
					</Grid>
					<div className={classes.btnContainer}>
						<Button type="submit" disabled={pristine || !valid} variant="contained" color="primary">
							<FormattedMessage id="form.button.label.submit"/>
						</Button>
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

function element(list, classes) {
	switch (list.type) {
		case 'radio':
			return (
				<Grid key={list.name} item xs={list.width === 'full' ? 12 : 6}>
					<Field
						className={classes.textField}
						component={renderRadioButton}
						label={list.label}
						name={list.name}
						type={list.type}
						options={list.options}
					/>
				</Grid>
			);
		default:
			return (
				<Grid key={list.name} item xs={list.width === 'full' ? 12 : 6}>
					<Field
						className={classes.textField}
						component={renderTextField}
						label={list.label}
						name={list.name}
						type={list.type}
					/>
				</Grid>
			);
	}
}
