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
import {
	Grid,
	List
} from '@material-ui/core';
import {useCookies} from 'react-cookie';
import {useIntl} from 'react-intl';

import {commonStyles} from '../../styles/app';
import * as actions from '../../store/actions';
import {connect} from 'react-redux';
import ModalLayout from '../ModalLayout';
import Spinner from '../Spinner';
import ListComponent from '../ListComponent';

export default connect(mapStateToProps, actions)(props => {
	const {
		id,
		setIdentifierId,
		setIdentifierModal,
		loading,
		identifier,
		fetchIdentifier
	} = props;
	const classes = commonStyles();
	const intl = useIntl();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);

	useEffect(() => {
		const token = cookie[COOKIE_NAME];
		if (id !== null) {
			fetchIdentifier(id, token);
		}
	}, [cookie, fetchIdentifier, id]);

	function handleCloseModal() {
		setIdentifierModal(false);
		setIdentifierId(null);
	}

	let identifierDetails;
	if ((Object.keys(identifier).length === 0) || loading) {
		identifierDetails = <Spinner/>;
	} else {
		identifierDetails = (
			<>
				<Grid item xs={12} md={6}>
					<List>
						{
							Object.keys(identifier).map(key => {
								return key !== '_id' && typeof identifier[key] === 'string' ?
									(
										<ListComponent label={intl.formatMessage({id: `user.label.${key}`})} value={identifier[key]}/>
									) :
									null;
							})
						}
					</List>
				</Grid>
				<Grid item xs={12} md={6}>
					<List>
						{
							Object.keys(identifier).map(key => {
								return typeof identifier[key] === 'object' ?
									(
										<ListComponent fieldName={key} label={intl.formatMessage({id: `user.label.${key}`})} value={identifier[key]}/>
									) :
									null;
							})
						}
					</List>
				</Grid>
			</>
		);
	}

	const component = (
		<ModalLayout isTableRow handleCloseModal={handleCloseModal} color="primary" {...props} title="Identifier">
			<div className={classes.listItem}>
				<Grid container spacing={3} className={classes.listItemSpinner}>
					{identifierDetails}
				</Grid>
			</div>
		</ModalLayout>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.identifierRanges.loading,
		identifier: state.identifierRanges.identifier
	});
}
