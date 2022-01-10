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
	List,
	Fab
} from '@material-ui/core';
import {connect} from 'react-redux';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {validate} from '../../utils';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {FormattedMessage, useIntl} from 'react-intl';

import {commonStyles} from '../../styles/app';
import * as actions from '../../store/actions';
import AlertDialogs from '../AlertDialogs';
import Spinner from '../Spinner';
import CustomColor from '../../styles/app';
import ListComponent from '../ListComponent';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'userUpdateForm',
	validate,
	enableReinitialize: true
})(props => {
	const {user, userInfo, isAuthenticated, handleSubmit, updateUser, userUpdated, loading, fetchUser, match, lang, history} = props;
	const {id} = match.params;
	const classes = commonStyles();
	const intl = useIntl();
	const {role} = userInfo;
	const [isEdit, setIsEdit] = useState(false);
	const [openAlert, setOpenAlert] = useState(false);
	const [message, setMessage] = useState(null);
	const [confirmation, setConfirmation] = useState(false);

	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);

	useEffect(() => {
		const token = cookie[COOKIE_NAME];
		if (id !== null) {
			fetchUser(id, token);
		}
	}, [cookie, fetchUser, id, userUpdated]);

	useEffect(() => {
		if (confirmation) {
			const {_id, firstname, lastname, ...deletePayload} = {
				...user,
				givenName: user.firstname,
				familyName: user.lastname,
				active: false
			};
			updateUser(id, deletePayload, cookie[COOKIE_NAME], lang);
			setConfirmation(false);
			history.push('/users');
		}
	}, [confirmation, cookie, id, updateUser, user]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleEditClick = () => {
		setIsEdit(true);
	};

	function handleDeleteUser() {
		setMessage('Please confirm to delete');
	}

	function handleOnAgree() {
		setConfirmation(true);
	}

	function handleOnCancel() {
		setConfirmation(false);
	}

	const handleCancel = () => {
		setIsEdit(false);
	};

	const handleOnSubmit = values => {
		const newValues = {...values, givenName: values.firstname, familyName: values.lastname, displayName: values.displayname};
		updateUser(id, newValues, cookie[COOKIE_NAME], lang);
		setIsEdit(false);
	};

	function isEditable(key) {
		const editableFields = userInfo.role === 'admin' ?
			['id', 'publisher', 'firstname', 'lastname', 'displayname', 'preferences'] :
			(userInfo.role === 'publisher' ?
				['firstname', 'lastname', 'displayname', 'preferences'] :
				[]);

		return isEdit && editableFields.includes(key);
	}

	let userDetail;
	if ((Object.keys(user).length === 0) || loading) {
		userDetail = <Spinner/>;
	} else {
		userDetail = (
			<>
				{isEdit ?
					<>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(user).map(key => {
										return typeof user[key] === 'string' ?
											(
												<ListComponent edit={isEditable(key)} fieldName={key} label={intl.formatMessage({id: `user.label.${key}`})} value={user[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(user).map(key => {
										return typeof user[key] === 'object' ?
											(
												<ListComponent edit={isEditable(key)} fieldName={key} label={intl.formatMessage({id: `user.label.${key}`})} value={user[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
						{/* <Grid item xs={12} md={6}>
							<List>
								<ListItem>
									<ListItemText>
										<Grid container>
											<Grid item xs={4}>Name:</Grid>
											<Grid item xs={8}><Field name="name" className={formClasses.editForm} component={renderTextField}/></Grid>
										</Grid>
									</ListItemText>
								</ListItem>
							</List>
						</Grid> */}
					</> :
					<>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(user).map(key => {
										return (typeof user[key] === 'string' || typeof user[key] === 'boolean') ?
											(
												<ListComponent label={intl.formatMessage({id: `user.label.${key}`})} value={user[key].toString()}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(user).map(key => {
										return typeof user[key] === 'object' ?
											(
												<ListComponent fieldName={key} label={intl.formatMessage({id: `user.label.${key}`})} value={user[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
					</>}
			</>
		);
	}

	const component = (
		<Grid item xs={12}>
			{isEdit ?
				<div className={classes.listItem}>
					<form onSubmit={handleSubmit(handleOnSubmit)}>
						<div className={classes.btnContainer}>
							<Button onClick={handleCancel}>
								<FormattedMessage id="form.button.label.cancel"/>
							</Button>
							<Button variant="contained" color="primary" type="submit">
								<FormattedMessage id="form.button.label.update"/>
							</Button>
						</div>
						<Grid container spacing={3} className={classes.listItemSpinner}>
							{userDetail}
						</Grid>
					</form>
				</div> :
				<div className={classes.listItem}>
					<Grid container item xs={12}>
						<Grid item xs={2}>
							{isAuthenticated && role === 'admin' &&
								<Button
									className={classes.buttons}
									variant="contained"
									style={CustomColor.palette.red}
									startIcon={<DeleteForeverIcon/>}
									onClick={handleDeleteUser}
								>
									<FormattedMessage id="user.button.label.delete"/>
								</Button>}
						</Grid>
						<Grid item xs={2}>
							{isAuthenticated && (role === 'admin' || role === 'publisher') &&
								<Fab
									color="secondary"
									size="small"
									title={intl.formatMessage({id: 'user.fab.label.editUser'})}
									onClick={handleEditClick}
								>
									<EditIcon/>
								</Fab>}
						</Grid>
					</Grid>
					{/* <div className={classes.usersBtnContainer}> */}
					{/* </div> */}
					<Grid container spacing={3} className={classes.listItemSpinner}>
						{userDetail}
					</Grid>
				</div>}
			{
				message &&
					<AlertDialogs
						openAlert={openAlert}
						setOpenAlert={setOpenAlert}
						message={message}
						setMessage={setMessage}
						handleOnAgree={handleOnAgree}
						handleOnCancel={handleOnCancel}
					/>
			}
		</Grid>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	return ({
		user: state.users.user,
		userUpdated: state.users.userUpdated,
		loading: state.users.loading,
		initialValues: state.users.user,
		userInfo: state.login.userInfo,
		isAuthenticated: state.login.isAuthenticated
	});
}
