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

import React, {useEffect, useState} from 'react';
import {useCookies} from 'react-cookie';
import {connect} from 'react-redux';
import {Grid, Typography} from '@material-ui/core';
import {FormattedMessage} from 'react-intl';

import * as actions from '../../store/actions';
import Spinner from '../Spinner';
import TableComponent from '../TableComponent';
import useModalStyles from '../../styles/formList';
import SearchComponent from '../SearchComponent';
import TabComponent from '../TabComponent';
import ModalLayout from '../ModalLayout';
import PublisherRegistrationForm from '../form/publisherRegistrationForm/PublisherRegistrationForm';
import {commonStyles} from '../../styles/app';
export default connect(mapStateToProps, actions)(props => {
	const {fetchPublishersRequestsList, publishersRequestsList, loading, history} = props;
	/* global COOKIE_NAME */
	const [cookie] = useCookies(COOKIE_NAME);
	const classes = commonStyles();
	const modalClasses = useModalStyles();
	const [inputVal, setSearchInputVal] = useState('');
	const [page, setPage] = React.useState(0);
	const [sortStateBy, setSortStateBy] = useState('new');
	const [rowSelectedId, setRowSelectedId] = useState(null);
	const [isCreating, setIsCreating] = useState(false);

	useEffect(() => {
		fetchPublishersRequestsList({searchText: inputVal, token: cookie[COOKIE_NAME], sortStateBy: sortStateBy, sort: {'created.timestamp': -1}});
	}, [cookie, fetchPublishersRequestsList, isCreating, inputVal, sortStateBy]);

	const handleTableRowClick = id => {
		history.push(`/requests/publishers/${id}`);
		setRowSelectedId(id);
	};

	const handleChange = (event, newValue) => {
		setSortStateBy(newValue);
	};

	const headRows = [
		{id: 'state', label: 'State'},
		{id: 'name', label: 'Name'},
		{id: 'language', label: 'Language'}
	];

	let publishersRequestsData;
	if ((publishersRequestsList === undefined) || (loading)) {
		publishersRequestsData = <Spinner/>;
	} else if (publishersRequestsList.length === 0) {
		publishersRequestsData = <p><FormattedMessage id="app.render.noData"/></p>;
	} else {
		publishersRequestsData = (
			<TableComponent
				pagination
				data={publishersRequestsList
					.map(item => publishersRequestsRender(item.id, item.state, item.name, item.language))}
				handleTableRowClick={handleTableRowClick}
				rowSelectedId={rowSelectedId}
				headRows={headRows}
				page={page}
				setPage={setPage}
			/>
		);
	}

	function publishersRequestsRender(id, state, name, language) {
		return {
			id: id,
			state: state,
			name: name,
			language: language
		};
	}

	const component = (
		<Grid item xs={12} className={classes.listSearch}>
			<Typography variant="h5"><FormattedMessage id="request.publisher.search-title"/></Typography>
			<SearchComponent searchFunction={fetchPublishersRequestsList} setSearchInputVal={setSearchInputVal}/>
			<TabComponent
				tabClass={classes.tab}
				tabsClass={classes.tabs}
				sortStateBy={sortStateBy}
				handleChange={handleChange}
			/>
			<ModalLayout form label="Publisher Registration" title={<FormattedMessage id="request.button.publisher-registration"/>} name="newPublisher" variant="outlined" classed={modalClasses.button} color="primary">
				<PublisherRegistrationForm setIsCreating={setIsCreating} {...props}/>
			</ModalLayout>
			{publishersRequestsData}
		</Grid>
	);
	return {
		...component
	};
});

function mapStateToProps(state) {
	return ({
		loading: state.publisher.listLoading,
		publishersRequestsList: state.publisher.publishersRequestsList,
		totalDoc: state.publisher.totalDoc
	});
}
