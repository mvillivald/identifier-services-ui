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
import {useCookies} from 'react-cookie';
import {reduxForm, Field} from 'redux-form';
import {validate} from '@natlibfi/identifier-services-commons';
import {FormattedMessage} from 'react-intl';
import {
	Grid,
	Button
} from '@material-ui/core';

import renderTextField from '../../form/render/renderTextField';
import renderSelect from '../../form/render/renderSelect';
import {commonStyles} from '../../../styles/app';
import formStyles from '../../../styles/form';

export default reduxForm({
	form: 'rangeCreation',
	validate,
	initialValues: {
		prefix: '978'
	},
	enableReinitialize: true
})(props => {
	const {handleSubmit, createIsbnRange, setFinishedCreating, handleClose, lang} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const classes = commonStyles();
	const formClasses = formStyles();

	async function handleCreateRange(values) {
		await createIsbnRange(values, cookie[COOKIE_NAME], lang);
		setFinishedCreating(true);
		handleClose();
	}

	const formFields = [
		{name: 'prefix', type: 'text'},
		{name: 'langGroup', type: 'text'},
		{name: 'category', type: 'select', option: categoryOption()},
		{name: 'rangeStart', type: 'text'},
		{name: 'rangeEnd', type: 'text'}
	];

	function categoryOption() {
		return [
			{label: '', value: ''},
			{label: '1', value: '1'},
			{label: '2', value: '2'},
			{label: '3', value: '3'},
			{label: '4', value: '4'},
			{label: '5', value: '5'}
		];
	}

	const component = (
		<div className={classes.listItem}>
			<form onSubmit={handleSubmit(handleCreateRange)}>
				<Grid container spacing={2} className={classes.listItemSpinner}>
					{formFields.map(field => (
						field.type === 'text' ?
							(
								<Grid key={field.name} item container xs={4} md={4}>
									<Grid item xs={12} md={12}>
										<Field
											name={field.name}
											type={field.type}
											className={formClasses.selectField}
											label={<FormattedMessage id={`ranges.${field.name}`}/>}
											component={renderTextField}
										/>
									</Grid>
								</Grid>
							) : (
								<Grid key={field.name} item container xs={4} md={4}>
									<Grid item xs={12} md={12}>
										<Field
											name={field.name}
											type={field.type}
											className={formClasses.selectField}
											label={<FormattedMessage id={`ranges.${field.name}`}/>}
											component={renderSelect}
											options={field.option}
										/>
									</Grid>
								</Grid>
							)
					))}
				</Grid>
				<div className={classes.btnContainer}>
					<Button variant="contained" color="primary" type="submit">
						<FormattedMessage id="form.button.label.submit"/>
					</Button>
				</div>
			</form>
		</div>
	);
	return {
		...component
	};
});
