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
	Typography,
	Fab
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {FormattedMessage, useIntl} from 'react-intl';

import {commonStyles} from '../../styles/app';
import * as actions from '../../store/actions';
import {connect} from 'react-redux';
import {validate} from '@natlibfi/identifier-services-commons';
import ModalLayout from '../ModalLayout';
import Spinner from '../Spinner';
import ListComponent from '../ListComponent';
import TableComponent from '../publishersRequests/TableComponent';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import {formatClassificationDefaultValue} from '../form/publisherRegistrationForm/commons';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'publisherUpdateForm',
	validate,
	enableReinitialize: true
})(props => {
	const {
		fetchPublisher,
		updatePublisher,
		id,
		publisher,
		publisherUpdated,
		loading,
		handleSubmit,
		fetchIDRIsbnList,
		fetchIDRIsmnList,
		rangleListLoading,
		isbnRangeList,
		ismnRangeList,
		isAuthenticated,
		clearFields,
		userInfo} = props;
	const classes = commonStyles();
	const intl = useIntl();
	const [isEdit, setIsEdit] = useState(false);
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [assignRange, setAssignRange] = useState(false);
	const [rangeType, setRangeType] = useState('');
	const [isbnValue, setIsbnValue] = React.useState('');
	const [ismnValue, setIsmnValue] = React.useState('');

	const activeCheck = {
		checked: true
	};

	useEffect(() => {
		if (id !== null) {
			fetchPublisher(id, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchPublisher, id, isbnValue, ismnValue, publisherUpdated]);
	const handleEditClick = () => {
		setIsEdit(true);
	};

	const handleCancel = () => {
		setIsEdit(false);
	};

	function isEditable(key) {
		const nonEditableFields = userInfo.role === 'admin' ?
			['lastUpdated', '_id', 'isbnRange', 'ismnRange'] :
			(userInfo.role === 'publisher-admin' ?
				['lastUpdated', '_id', 'request', 'metadataDelivery', 'isbnRange', 'ismnRange'] :
				[]);

		return isEdit && !nonEditableFields.includes(key);
	}

	const {organizationDetails, _id, ...formattedPublisherDetail} = {...publisher, ...publisher.organizationDetails, notes: publisher && publisher.notes && publisher.notes.map(item => {
		return {note: Buffer.from(item).toString('base64')};
	})};
	let publisherDetail;
	if ((Object.keys(publisher).length === 0) || loading) {
		publisherDetail = <Spinner/>;
	} else {
		publisherDetail = (
			<>
				{isEdit ?
					<>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(formattedPublisherDetail).map(key => {
										return typeof formattedPublisherDetail[key] === 'string' ?
											(
												<ListComponent clearFields={clearFields} edit={isEditable(key)} fieldName={key} label={intl.formatMessage({id: `publisherRender.label.${key}`})} value={formattedPublisherDetail[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(formattedPublisherDetail).map(key => {
										return typeof formattedPublisherDetail[key] === 'object' ?
											(
												<ListComponent clearFields={clearFields} edit={isEditable(key)} fieldName={key} label={intl.formatMessage({id: `publisherRender.label.${key}`})} value={formattedPublisherDetail[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
					</> :
					<>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(formattedPublisherDetail).map(key => {
										return typeof formattedPublisherDetail[key] === 'string' ?
											(
												<ListComponent label={intl.formatMessage({id: `publisherRender.label.${key}`})} value={formattedPublisherDetail[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(formattedPublisherDetail).map(key => {
										return typeof formattedPublisherDetail[key] === 'object' ?
											(
												<ListComponent label={intl.formatMessage({id: `publisherRender.label.${key}`})} value={formattedPublisherDetail[key]}/>
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

	const handlePublisherUpdate = values => {
		const token = cookie[COOKIE_NAME];
		const {_id, ...updateValues} = values;
		const newClassification = values.classification.map(item => item.value.toString());
		updatePublisher(_id, {...updateValues, classification: newClassification}, token);
		setIsEdit(false);
	};

	const handleRangeUpdate = () => {
		const token = cookie[COOKIE_NAME];
		const {_id, ...publisherWithRange} = {
			...publisher,
			isbnRange: isbnValue,
			ismnRange: ismnValue
		};
		updatePublisher(_id, publisherWithRange, token);
	};

	function handleRange() {
		setIsbnValue(publisher.isbnRange);
		setIsmnValue(publisher.ismnRange);
		setAssignRange(!assignRange);
	}

	function displayISBNRanges(type) {
		setRangeType(type);
		fetchIDRIsbnList({searchText: '', token: cookie[COOKIE_NAME], offset: null, activeCheck: activeCheck});
	}

	function displayISMNRanges(type) {
		setRangeType(type);
		fetchIDRIsmnList({searchText: '', token: cookie[COOKIE_NAME], offset: null, activeCheck: activeCheck});
	}

	function handleChange(e, val) {
		if (val === 'isbn') {
			setIsbnValue(e.target.value);
		}

		if (val === 'ismn') {
			setIsmnValue(e.target.value);
		}
	}

	function displayRanges(val) {
		if (val === 'isbn') {
			let data;
			if (rangleListLoading) {
				data = <Spinner/>;
			} else if (isbnRangeList.length === 0) {
				data = intl.formatMessage({id: 'publisher.heading.noRanges'});
			} else {
				data = (
					<TableComponent data={isbnRangeList} value={isbnValue} handleChange={e => handleChange(e, 'isbn')}/>
				);
			}

			return data;
		}

		if (val === 'ismn') {
			let data;
			if (rangleListLoading) {
				data = <Spinner/>;
			} else if (ismnRangeList.length === 0) {
				data = intl.formatMessage({id: 'publisher.heading.noRanges'});
			} else {
				data = (
					<TableComponent data={ismnRangeList} value={ismnValue} handleChange={e => handleChange(e, 'ismn')}/>
				);
			}

			return data;
		}

		return <Typography variant="h6"><FormattedMessage id="publisher.heading.assignRange"/></Typography>;
	}

	const component = (
		<ModalLayout isTableRow color="primary" title={intl.formatMessage({id: 'app.modal.title.publisher'})} {...props}>
			{isEdit ?
				<div className={classes.listItem}>
					<form>
						<Grid container spacing={3} className={classes.listItemSpinner}>
							{publisherDetail}
						</Grid>
						<div className={classes.btnContainer}>
							<Button onClick={handleCancel}>
								<FormattedMessage id="form.button.label.cancel"/>
							</Button>
							<Button variant="contained" color="primary" onClick={handleSubmit(handlePublisherUpdate)}>
								<FormattedMessage id="form.button.label.update"/>
							</Button>
						</div>
					</form>
				</div> :
				<div className={classes.listItem}>
					{assignRange ?
						<div className={classes.listItem}>
							<Button
								variant="outlined"
								startIcon={<ArrowBackIosIcon/>}
								onClick={handleRange}
							>
								<FormattedMessage id="form.button.label.back"/>
							</Button>&nbsp;
							<Button variant={rangeType === 'isbn' ? 'contained' : 'outlined'} color="primary" onClick={() => displayISBNRanges('isbn')}>
								<FormattedMessage id="publisher.button.label.IsbnRanges"/>
							</Button>&nbsp;
							<Button variant={rangeType === 'ismn' ? 'contained' : 'outlined'} color="primary" onClick={() => displayISMNRanges('ismn')}>
								<FormattedMessage id="publisher.button.label.IsmnRanges"/>
							</Button>
							{displayRanges(rangeType)}
							{rangeType ?
								<Button variant="outlined" color="primary" onClick={handleRangeUpdate}>
									<FormattedMessage id="form.button.label.update"/> {rangeType}
								</Button> :
								null}
						</div> :
						<>
							<Grid container spacing={3} className={classes.listItemSpinner}>
								{publisherDetail}
							</Grid>
							{
								isAuthenticated && userInfo.role === 'admin' &&
									<>
										<Button variant="outlined" color="primary" onClick={handleRange}>
											<FormattedMessage id="publisher.button.label.assignRanges"/>
										</Button>
										<Fab
											color="primary"
											size="small"
											title={intl.formatMessage({id: 'user.fab.label.editUser'})}
											onClick={handleEditClick}
										>
											<EditIcon/>
										</Fab>
									</>
							}
							{
								isAuthenticated && userInfo.role === 'publisher-admin' && // Different condition for publisher-Admin
									<Fab
										color="primary"
										size="small"
										title={intl.formatMessage({id: 'user.fab.label.editUser'})}
										onClick={handleEditClick}
									>
										<EditIcon/>
									</Fab>
							}
							{isAuthenticated && userInfo.role === 'publisher' &&
								<div className={classes.btnContainer}>
									<Fab
										color="primary"
										size="small"
										title="Edit Publisher Detail"
										onClick={handleEditClick}
									>
										<EditIcon/>
									</Fab>
								</div>}
						</>}
				</div>}
		</ModalLayout>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	function formatInitialValues(values) {
		return {...values, classification: values.classification && formatClassificationDefaultValue(values.classification)};
	}

	return ({
		publisher: state.publisher.publisher,
		publisherUpdated: state.publisher.publisherUpdated,
		loading: state.publisher.loading,
		initialValues: formatInitialValues(state.publisher.publisher),
		isAuthenticated: state.login.isAuthenticated,
		userInfo: state.login.userInfo,
		rangleListLoading: state.identifierRanges.rangeListLoading,
		isbnRangeList: state.identifierRanges.isbnList,
		ismnRangeList: state.identifierRanges.ismnList
	});
}
