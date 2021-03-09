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
import {Field, FieldArray, reduxForm, getFormValues} from 'redux-form';
import {Button, Grid} from '@material-ui/core';
import PropTypes from 'prop-types';
import {validate} from '@natlibfi/identifier-services-commons';
import {useCookies} from 'react-cookie';
import {FormattedMessage} from 'react-intl';

import useStyles from '../../styles/form';
import renderTextField from './render/renderTextField';
import renderTextArea from './render/renderTextArea';
import renderStringArray from './render/renderStringArray';
import renderSelect from './render/renderSelect';
import * as actions from '../../store/actions/userActions';

const fieldArray = [
	{
		name: 'templateName',
		type: 'text',
		label: <FormattedMessage id="templateCreation.form.templateName"/>,
		width: 'half'
	},
	{
		name: 'subject',
		type: 'text',
		label: <FormattedMessage id="templateCreation.form.subject"/>,
		width: 'half'
	},
	{
		name: 'language',
		type: 'select',
		label: <FormattedMessage id="templateCreation.form.selectLanguage"/>,
		width: 'half',
		defaultValue: 'eng',
		options: [
			{label: 'English ', value: 'eng'},
			{label: 'Suomi', value: 'fin'},
			{label: 'Svenska', value: 'swe'}
		]
	},
	{
		name: 'body',
		type: 'textarea',
		label: <FormattedMessage id="templateCreation.form.body"/>,
		width: 'full'
	},
	{
		name: 'notes',
		type: 'arrayString',
		label: <FormattedMessage id="templateCreation.form.notes"/>,
		width: 'full',
		subName: 'note'
	}
];

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'templateCreationForm',
	initialValues: {
		language: 'eng'
	},
	validate
})(
	props => {
		const {
			handleClose,
			handleSubmit,
			createMessageTemplate,
			clearFields,
			pristine,
			valid
		} = props;
		const classes = useStyles();
		/* global COOKIE_NAME */
		const [cookie] = useCookies(COOKIE_NAME);

		const handleCreateTemplate = async values => {
			const newValues = {...values,
				name: values.templateName,
				body: Buffer.from(values.body).toString('base64'),
				notes: values.notes.map(note => Buffer.from(note).toString('base64'))
			};
			delete newValues.templateName;
			createMessageTemplate(newValues, cookie[COOKIE_NAME]);
			handleClose();
		};

		const component = (
			<form className={classes.container} onSubmit={handleSubmit(handleCreateTemplate)}>
				<div className={classes.subContainer}>
					<Grid container spacing={2} direction="row">
						{fieldArray.map(list => (
							<Grid key={list.name} item xs={list.width === 'full' ? 12 : 6}>
								{element(list, classes, clearFields)}
							</Grid>
						))}
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

function element(list, classes, clearFields) {
	switch (list.type) {
		case 'arrayString':
			return (
				<FieldArray
					className={classes.arrayString}
					component={renderStringArray}
					name={list.name}
					type={list.type}
					label={list.label}
					props={{clearFields, name: list.name, subName: list.subName}}
				/>
			);
		case 'select':
			return (
				<Field
					className={classes.selectField}
					component={renderSelect}
					label={list.label}
					name={list.name}
					type={list.type}
					options={list.options}
				/>
			);
		case 'text':
			return (
				<Field
					className={classes.textField}
					component={renderTextField}
					label={list.label}
					name={list.name}
					type={list.type}
				/>
			);
		case 'textarea':
			return (
				<Field
					className={classes.textArea}
					component={renderTextArea}
					label={list.label}
					name={list.name}
					type={list.type}
				/>
			);

		default:
			return null;
	}
}

function mapStateToProps(state) {
	return ({
		captcha: state.common.captcha,
		publisherValues: getFormValues('publisherRegistrationForm')(state)
	});
}
