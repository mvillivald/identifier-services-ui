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
import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {useCookies} from 'react-cookie';
import {Field, reduxForm} from 'redux-form';
import {Button, Grid} from '@material-ui/core';
import {validate} from '../../utils';
import {FormattedMessage} from 'react-intl';

import renderTextField from './render/renderTextField';
import useStyles from '../../styles/form';
import * as actions from '../../store/actions/userActions';
import renderMultiSelect from './render/renderMultiSelect';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'createUnboundIsbnListForm',
	validate
})(props => {
	const {
		fetchIDR,
		fetchPublisherOption,
		subRangeId,
		rangeType,
		publisherOptions,
		handleSubmit,
		handleClose,
		createUnboundIsbnList,
		pristine,
		valid,
		lang
	} = props;
	const [cookie] = useCookies(COOKIE_NAME);
	const classes = useStyles();
	/* global COOKIE_NAME */
	const formFields = [
		{
			name: 'identifierType',
			type: 'text',
			label: <FormattedMessage id="createUnboundListForm.identifierType"/>,
			width: 'half'
		},
		{
			name: 'identifierCount',
			type: 'number',
			label: <FormattedMessage id="createUnboundListForm.identifierCount"/>,
			width: 'half'
		},
		{
			name: 'publisherId',
			type: 'select',
			label: <FormattedMessage id="createUnboundListForm.publisher"/>,
			options: publisherOptions
		}
	];

	useEffect(() => {
		fetchPublisherOption(cookie[COOKIE_NAME]);
	}, [cookie, fetchPublisherOption]);

	useEffect(() => {
		if (subRangeId !== '' && rangeType === 'isbnBatch') {
			run();
		}

		async function run() {
			await fetchIDR(subRangeId, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchIDR, rangeType, subRangeId]);

	async function handleCreateRange(values) {
		await createUnboundIsbnList({...values, subRangeId}, cookie[COOKIE_NAME], lang);
		handleClose();
	}

	function render(list) {
		switch (list.type) {
			case 'text':
			case 'number':
				return (
					<Grid key={list.name} item xs={list.width === 'full' ? 12 : 6}>
						<Field
							className={classes.textField}
							component={renderTextField}
							label={list.label}
							name={list.name}
						/>
					</Grid>
				);

			case 'select':
				return (
					<Grid key={list.name} item xs={list.width === 'full' ? 12 : 6}>
						<Field
							createable
							className={classes.textField}
							component={renderMultiSelect}
							label={list.label}
							name={list.name}
							options={publisherOptions}
							props={{isMulti: false}}
						/>
					</Grid>
				);
			default:
				return null;
		}
	}

	const component = (
		<form className={classes.pickListContainer} onSubmit={handleSubmit(handleCreateRange)}>
			<Grid container direction="column">
				{formFields.map(item => render(item))}
				<Grid item xs={12} md={12} className={classes.btnContainer}>
					<Button type="submit" disabled={pristine || !valid} variant="contained" color="primary">
						<FormattedMessage id="form.button.label.update"/>
					</Button>
				</Grid>
			</Grid>
		</form>
	);
	return {...component};
}));

function mapStateToProps(state) {
	return ({
		initialValues: formatInitialValues(state.identifierRanges.range),
		publisherOptions: state.publisher.publisherOptions
	});
}

function formatInitialValues() {
	return {
		identifierType: 'ISBN',
		publicationIdentifierRangeId: 'rangeId'
	};
}
