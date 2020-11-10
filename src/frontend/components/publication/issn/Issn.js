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
import {
	Button,
	Grid,
	Fab
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {validate} from '@natlibfi/identifier-services-commons';
import {FormattedMessage, useIntl} from 'react-intl';

import {commonStyles} from '../../../styles/app';
import * as actions from '../../../store/actions';
import ModalLayout from '../../ModalLayout';
import PublicationRenderComponent from '../PublicationRenderComponent';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'issnUpdateForm',
	validate,
	enableReinitialize: true
})(props => {
	const {id, issn, userInfo, loading, fetchIssn, handleSubmit, clearFields, updatePublicationIssn, updatedIssn} = props;
	const intl = useIntl();
	const classes = commonStyles();
	const {role} = userInfo;
	const [isEdit, setIsEdit] = useState(false);
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);

	useEffect(() => {
		if (id !== null) {
			fetchIssn({id: id, token: cookie[COOKIE_NAME]});
		}
	}, [cookie, fetchIssn, id, updatedIssn]);

	const handleEditClick = () => {
		setIsEdit(true);
	};

	const handleCancel = () => {
		setIsEdit(false);
	};

	const handlePublicationUpdate = values => {
		const {_id, ...updateValues} = values;
		const token = cookie[COOKIE_NAME];
		console.log(updateValues, token);
		updatePublicationIssn(id, updateValues, token);
		setIsEdit(false);
	};

	function isEditable(key) {
		const nonEditableFields = userInfo.role === 'admin' ?
			['lastUpdated', '_id', 'associatedRange', 'identifier', 'metadataReference', 'request', 'associatedRange', 'type'] :
			(userInfo.role === 'publisher-admin' ?
				['lastUpdated', '_id', 'associatedRange', 'identifier', 'metadataReference', 'request', 'associatedRange', 'type'] :
				[]);

		return isEdit && !nonEditableFields.includes(key);
	}

	const component = (
		<ModalLayout isTableRow color="primary" title={intl.formatMessage({id: 'app.modal.title.publicationIssn'})} {...props}>
			{isEdit ?
				<div className={classes.listItem}>
					<form>
						<Grid container spacing={3} className={classes.listItemSpinner}>
							<PublicationRenderComponent publication={issn} loading={loading} isEdit={isEdit} clearFields={clearFields} isEditable={isEditable}/>
						</Grid>
						<div className={classes.btnContainer}>
							<Button onClick={handleCancel}>
								<FormattedMessage id="form.button.label.cancel"/>
							</Button>
							<Button variant="contained" color="primary" onClick={handleSubmit(handlePublicationUpdate)}>
								<FormattedMessage id="form.button.label.update"/>
							</Button>
						</div>
					</form>
				</div> :
				<div className={classes.listItem}>
					<Grid container spacing={3} className={classes.listItemSpinner}>
						<PublicationRenderComponent publication={issn} loading={loading} isEdit={isEdit} clearFields={clearFields} isEditable={isEditable}/>
					</Grid>
					{role !== undefined && role === 'admin' &&
						<div className={classes.btnContainer}>
							<Fab
								color="primary"
								size="small"
								title={intl.formatMessage({id: 'publication.issn.edit.label'})}
								onClick={handleEditClick}
							>
								<EditIcon/>
							</Fab>
						</div>}
				</div>}
		</ModalLayout>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	return ({
		issn: state.publication.issn,
		loading: state.publication.loading,
		initialValues: state.publication.issn,
		userInfo: state.login.userInfo,
		updatedIssn: state.publication.updatedIssn
	});
}
