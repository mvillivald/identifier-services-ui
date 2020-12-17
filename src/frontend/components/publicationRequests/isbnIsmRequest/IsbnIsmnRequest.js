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
	Grid,
	ButtonGroup,
	Button,
	TextareaAutosize,
	List,
	ExpansionPanel,
	ExpansionPanelDetails,
	ExpansionPanelSummary
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {reduxForm} from 'redux-form';
import {useCookies} from 'react-cookie';
import {useIntl, FormattedMessage} from 'react-intl';

import {commonStyles} from '../../../styles/app';
import * as actions from '../../../store/actions';
import {connect} from 'react-redux';
import {validate} from '@natlibfi/identifier-services-commons';
import ModalLayout from '../../ModalLayout';
import Spinner from '../../Spinner';
import ListComponent from '../../ListComponent';
import CustomColor from '../../../styles/app';

export default connect(mapStateToProps, actions)(reduxForm({
	form: 'publicationRequestIsbnIsmn',
	validate,
	enableReinitialize: true
})(props => {
	const {
		id,
		loading,
		fetchPublicationIsbnIsmnRequest,
		publicationIsbnIsmnRequest,
		updatePublicationIsbnIsmnRequest,
		setIsUpdating
	} = props;
	const classes = commonStyles();
	const intl = useIntl();
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const [buttonState, setButtonState] = useState('');
	const [reject, setReject] = useState(false);
	const [rejectReason, setRejectReason] = useState('');

	useEffect(() => {
		if (id !== null) {
			fetchPublicationIsbnIsmnRequest(id, cookie[COOKIE_NAME]);
		}
	}, [cookie, fetchPublicationIsbnIsmnRequest, id, buttonState]);

	function handleRejectClick() {
		setReject(!reject);
	}

	function handleRejectReason(e) {
		setRejectReason(e.target.value);
	}

	function handleRejectSubmit() {
		const newPublicationIsbnIsmnRequest = {
			...publicationIsbnIsmnRequest,
			state: 'rejected',
			rejectionReason: rejectReason
		};
		delete newPublicationIsbnIsmnRequest._id;
		updatePublicationIsbnIsmnRequest(publicationIsbnIsmnRequest._id, newPublicationIsbnIsmnRequest, cookie[COOKIE_NAME]);
		setReject(!reject);
		setButtonState(publicationIsbnIsmnRequest.state);
	}

	function handleAccept() {
		const newPublicationIsbnIsmnRequest = {
			...publicationIsbnIsmnRequest,
			state: 'accepted'
		};
		delete newPublicationIsbnIsmnRequest._id;
		updatePublicationIsbnIsmnRequest(publicationIsbnIsmnRequest._id, newPublicationIsbnIsmnRequest, cookie[COOKIE_NAME]);
		setButtonState(publicationIsbnIsmnRequest.state);
		setIsUpdating(true);
	}

	function renderButton(state, bgState) {
		switch (state) {
			case 'new':
				return (
					<ButtonGroup color="primary" aria-label="outlined primary button group">
						<Button disabled={state === 'new' && bgState !== 'processed'} variant="outlined" color="primary" onClick={handleAccept}>
							<FormattedMessage id="publicationRequestRender.button.label.accept"/>
						</Button>
						<Button variant="outlined" style={{color: 'red'}} onClick={handleRejectClick}>
							<FormattedMessage id="publicationRequestRender.button.label.reject"/>
						</Button>
					</ButtonGroup>
				);
			case 'accepted':
				return (
					<ButtonGroup color="primary" aria-label="outlined primary button group">
						<Button variant="contained" color="primary" size="small" style={{cursor: 'not-allowed'}}>
							<FormattedMessage id="publicationRequestRender.button.label.accepted"/>
						</Button>
					</ButtonGroup>
				);
			case 'rejected':
				return (
					<ButtonGroup color="error" aria-label="outlined primary button group">
						<Button variant="contained" style={CustomColor.palette.red} size="small">
							<FormattedMessage id="publicationRequestRender.button.label.rejected"/>
						</Button>
					</ButtonGroup>
				);
			case 'inProgress':
				return (
					<ButtonGroup color="primary" aria-label="outlined primary button group">
						<Button disabled variant="outlined" color="primary">
							<FormattedMessage id="publicationRequestRender.button.label.accept"/>
						</Button>
						<Button variant="outlined" style={{color: 'red'}} onClick={handleRejectClick}>
							<FormattedMessage id="publicationRequestRender.button.label.reject"/>
						</Button>
					</ButtonGroup>
				);
			default:
				return null;
		}
	}

	const {_id, state, ...formattedPublicationIsbnIsmnRequest} = publicationIsbnIsmnRequest;
	const {publisher, ...withoutPublisher} = {...formattedPublicationIsbnIsmnRequest};
	const onlyPublisher = formattedPublicationIsbnIsmnRequest && typeof formattedPublicationIsbnIsmnRequest.publisher === 'object' && formattedPublicationIsbnIsmnRequest.publisher;
	const {organizationDetails, ...formatOnlyPublisher} = {...onlyPublisher, ...onlyPublisher.organizationDetails};

	let publicationIsbnIsmnRequestDetail;
	if (formattedPublicationIsbnIsmnRequest === undefined || loading) {
		publicationIsbnIsmnRequestDetail = <Spinner/>;
	} else {
		publicationIsbnIsmnRequestDetail = (
			<>
				{typeof formattedPublicationIsbnIsmnRequest.publisher === 'string' ?
					<>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(formattedPublicationIsbnIsmnRequest).map(key => {
										return typeof formattedPublicationIsbnIsmnRequest[key] === 'string' ?
											(
												<ListComponent label={intl.formatMessage({id: `publicationRequest.label.${key}`})} value={formattedPublicationIsbnIsmnRequest[key]}/>
											) :
											null;
									})
								}
							</List>
						</Grid>
						<Grid item xs={12} md={6}>
							<List>
								{
									Object.keys(formattedPublicationIsbnIsmnRequest).map(key => {
										return typeof formattedPublicationIsbnIsmnRequest[key] === 'object' ?
											(
												<ListComponent label={intl.formatMessage({id: `publicationRequest.label.${key}`})} value={formattedPublicationIsbnIsmnRequest[key]}/>
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
									Object.keys(withoutPublisher).map(key => {
										return <ListComponent key={key} label={intl.formatMessage({id: `publicationRequest.label.${key}`})} value={withoutPublisher[key]}/>;
									})
								}
							</List>
						</Grid>
						<Grid item xs={12} md={6}>
							<ExpansionPanel>
								<ExpansionPanelSummary
									expandIcon={<ExpandMoreIcon/>}
									aria-controls="panel1a-content"
									id="panel1a-header"
								>
									<FormattedMessage id="publicationRequest.label.publisherDetails"/>
								</ExpansionPanelSummary>
								<ExpansionPanelDetails>
									<List>
										{
											Object.keys(formatOnlyPublisher).map(key => {
												return <ListComponent key={key} label={intl.formatMessage({id: `publisherRender.label.${key}`})} value={formatOnlyPublisher[key]}/>;
											})
										}
									</List>
								</ExpansionPanelDetails>
							</ExpansionPanel>

						</Grid>
					</>}
			</>
		);
	}

	const component = (
		<ModalLayout isTableRow color="primary" title="Publication Request Detail" {...props}>
			<div className={classes.listItem}>
				<Grid container spacing={3} className={classes.listItemSpinner}>
					{publicationIsbnIsmnRequestDetail}
					{reject ?
						<>
							<Grid item xs={12}>
								<TextareaAutosize
									aria-label="Minimum height"
									rows={8}
									placeholder="Rejection reason here..."
									className={classes.textArea}
									value={rejectReason}
									onChange={handleRejectReason}
								/>
							</Grid>
							<Grid item xs={12}>
								<Button variant="contained" onClick={handleRejectClick}>
									<FormattedMessage id="form.button.label.cancel"/>
								</Button>
								<Button variant="contained" color="primary" onClick={handleRejectSubmit}>
									<FormattedMessage id="form.button.label.submit"/>
								</Button>
							</Grid>
						</> :
						<Grid item xs={12}>
							{renderButton(publicationIsbnIsmnRequest.state, publicationIsbnIsmnRequest.backgroundProcessingState)}
						</Grid>}
				</Grid>
			</div>
		</ModalLayout>
	);
	return {
		...component
	};
}));

function mapStateToProps(state) {
	return ({
		publicationIsbnIsmnRequest: state.publication.publicationIsbnIsmnRequest,
		loading: state.publication.loading,
		isAuthenticated: state.login.isAuthenticated,
		userInfo: state.login.userInfo,
		rangesList: state.identifierRanges.rangesList
	});
}
